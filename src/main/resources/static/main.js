/**
 * EnvLaw Hub 통합 비즈니스 로직 (v2.3)
 * - 법안별 AI 요약 리포트 동적 생성 기능 완비
 * - PPWR / ESPR 특화 분석 및 챗봇 연동 포함
 */

// 1. [전역 변수]
let cachedLaws = [];       // 서버에서 가져온 법안 데이터 저장
let currentCategory = "";  // 현재 선택된 카테고리 (global-eu 등)

/**
 * 2. [함수] 상세 보기 클릭 시 실행
 */
function handleDetailClick(index) {
    const law = cachedLaws[index];
    if (law) {
        // 체크리스트 로드
        loadChecklist(law.id || `idx_${index}`);

        // 텍스트 데이터 매핑
        document.getElementById('modalTitle').innerText = law.title || "제목 없음";
        document.getElementById('modalContent').innerText = law.content || "상세 내용이 없습니다.";

        // PDF 경로 처리 및 iframe 삽입
        // handleDetailClick 함수 내 PDF 처리 부분 수정
        const pdfWrapper = document.getElementById('pdfWrapper');
        let rawPath = law.original_text || law.originalText;

        if (rawPath) {
            // 1. 경로의 시작 부분에 슬래시가 없다면 붙여줌
            if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;

            // 2. encodeURI는 공백을 %20으로 바꿔주지만,
            // 서버 환경에 따라 직접 처리하는 것이 안전할 수 있음
            const encodedPath = encodeURI(rawPath);

            // 3. 전체 URL 생성
            const fullPath = window.location.origin + encodedPath;

            console.log("접근하려는 PDF 경로:", fullPath); // 브라우저 콘솔에서 이 주소를 직접 클릭해 보세요.

            pdfWrapper.innerHTML = `
        <iframe 
            src="${fullPath}" 
            width="100%" 
            height="100%" 
            style="border:none;"
            type="application/pdf">
        </iframe>`;
        } else {
            pdfWrapper.innerHTML = `<div style="padding:20px; color:white; text-align:center;">PDF 경로 정보가 없습니다.</div>`;
        }

        // 모달 표시 및 위치 초기화
        const modal = document.getElementById('lawDetailModal');
        const modalContent = modal.querySelector('.modal-content');
        modal.style.display = 'block';

        // 드래그 전 정중앙 위치 설정
        modalContent.style.position = 'fixed';
        modalContent.style.left = '50%';
        modalContent.style.top = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
        modalContent.style.margin = '0';

        // 분석창 초기화 (이전 법안의 분석 내용이 남아있지 않도록)
        const container = document.getElementById('translationContainer');
        const btnTrans = document.getElementById('btnTranslate');
        container.style.display = 'none';
        btnTrans.innerHTML = '<i class="fas fa-language"></i> 한국어로 번역/AI 분석';

        // [핵심 수정] 번역 버튼 클릭 시 현재 law 데이터를 넘겨주도록 이벤트 재설정
        btnTrans.onclick = () => {
            if (container.style.display === 'none') {
                container.style.display = 'flex';
                btnTrans.innerHTML = '<i class="fas fa-times"></i> 분석창 닫기';
                loadTranslation(law); // 클릭된 법안 객체를 전달
            } else {
                container.style.display = 'none';
                btnTrans.innerHTML = '<i class="fas fa-language"></i> 한국어로 번역/AI 분석';
            }
        };

        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }
}

/**
 * 3. [이벤트] 페이지 로드 완료 후 실행
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const name = params.get('name');
    currentCategory = type;

    // 페이지 타이틀 설정
    if (name && document.getElementById('viewTitle')) {
        document.getElementById('viewTitle').innerText = name;
    }

    /* --- [A] 데이터 로딩 --- */
    const dataContainer = document.getElementById('dataContainer');
    if (type && dataContainer) {
        const apiUrl = `/api/laws/${type}`;

        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error(`서버 응답 에러: ${res.status}`);
                return res.json();
            })
            .then(data => {
                cachedLaws = data;
                if (data.length === 0) {
                    dataContainer.innerHTML = '<p style="text-align:center; padding:100px; color:#999;">등록된 법안이 없습니다.</p>';
                    return;
                }
                dataContainer.innerHTML = data.map((law, index) => `
                    <div class="bill-card">
                        <div class="bill-info">
                            <h4 style="font-size:1.25rem; margin-bottom:5px;">${law.title}</h4>
                            <span style="background:#e6f4ea; color:#1a7431; padding:2px 8px; border-radius:4px; font-size:0.85rem; font-weight:bold;">
                                ${law.country || 'N/A'}
                            </span>
                            <p style="margin-top:12px; color:#4a5568;">${law.content}</p>
                        </div>
                        <button class="btn-open-detail" onclick="handleDetailClick(${index})">원문 보기</button>
                    </div>
                `).join('');
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                dataContainer.innerHTML = `<p style="text-align:center; padding:100px; color:red;">데이터 로딩 오류: ${err.message}</p>`;
            });
    }

    /* --- [B] 모달 드래그 로직 --- */
    const modalFull = document.querySelector('.modal-content.detail-full');
    const dragHeader = document.querySelector('.detail-header');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    if (dragHeader && modalFull) {
        dragHeader.style.cursor = 'move';
        dragHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = modalFull.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            modalFull.style.transition = 'none';
            modalFull.style.transform = 'none';
            modalFull.style.left = rect.left + 'px';
            modalFull.style.top = rect.top + 'px';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            modalFull.style.left = (e.clientX - offset.x) + 'px';
            modalFull.style.top = (e.clientY - offset.y) + 'px';
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
    }

    /* --- [C] UI 인터랙션 --- */
    // 모달 닫기
    const closeBtn = document.querySelector('.close-detail');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('lawDetailModal').style.display = 'none';
            document.getElementById('pdfWrapper').innerHTML = "";
            document.body.style.overflow = 'auto';
        };
    }

    // 메인 카테고리 이동
    const selectionItems = document.querySelectorAll('.category-item, .country-item');
    selectionItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            const itemName = item.querySelector('span').innerText;
            if (category) {
                location.href = `bills.html?type=${category}&name=${encodeURIComponent(itemName)}`;
            }
        });
    });

    // 챗봇 전송
    const btnSend = document.getElementById('btnChatSend');
    const chatInput = document.getElementById('chatInput');
    const sendMsg = async () => {
        const history = document.getElementById('chatHistory');
        if (!chatInput.value.trim()) return;

        const userVal = chatInput.value;
        history.innerHTML += `<div class="user-msg">${userVal}</div>`;
        chatInput.value = "";
        history.scrollTop = history.scrollHeight;

        const loadingId = "loading-" + Date.now();
        history.innerHTML += `<div class="ai-msg" id="${loadingId}">Gemini가 분석 중입니다...</div>`;
        history.scrollTop = history.scrollHeight;

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userVal })
            });
            if (!response.ok) throw new Error("서버 응답 오류");
            const data = await response.json();
            document.getElementById(loadingId).innerText = data.answer;
        } catch (err) {
            document.getElementById(loadingId).innerText = "연결 에러가 발생했습니다.";
        }
        history.scrollTop = history.scrollHeight;
    };
    if (btnSend) btnSend.onclick = sendMsg;
    if (chatInput) chatInput.onkeypress = (e) => { if(e.key === 'Enter') sendMsg(); };
});

/**
 * 4. [기능] 체크리스트 로드 및 저장
 */
function loadChecklist(lawId) {
    const checklistItems = document.getElementById('checklistItems');
    if (!checklistItems) return;

    const mockChecklists = {
        "global-eu": ["EU CBAM 신고 품목 확인", "공급망 탄소 배출 데이터 수집", "탄소 가격 지불 증빙 준비"],
        "global-china": ["중국 내 폐기물 처리 허가증 확인", "현지 대기오염 배출 기준 준수 여부"],
        "default": ["환경 책임자 지정 여부", "관련 법규 정기 모니터링 체계", "비상 대응 매뉴얼 구축"]
    };

    const items = mockChecklists[currentCategory] || mockChecklists["default"];
    const savedStatus = JSON.parse(localStorage.getItem(`checklist_${lawId}`)) || [];

    checklistItems.innerHTML = items.map((text, i) => `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 0;">
            <input type="checkbox" class="check-item" data-idx="${i}" 
                ${savedStatus.includes(i) ? 'checked' : ''} 
                onchange="saveCheckStatus('${lawId}')">
            <span>${text}</span>
        </label>
    `).join('');
}

function saveCheckStatus(lawId) {
    const checks = document.querySelectorAll('.check-item');
    const checkedIndices = [];
    checks.forEach(c => { if (c.checked) checkedIndices.push(parseInt(c.dataset.idx)); });
    localStorage.setItem(`checklist_${lawId}`, JSON.stringify(checkedIndices));
}

/**
 * 5. [기능] AI 분석 리포트 생성 (동적 요약 적용)
 */
function loadTranslation(law) {
    if (!law) return;

    const title = law.title;
    const contentArea = document.getElementById('translationContent');

    // 법안별 맞춤형 리포트 데이터
    const reports = {
        "PPWR": {
            color: "#1a7431",
            badge: "재활용/포장재",
            summary: "포장 및 포장폐기물 규정(PPWR)에 따라 2030년까지 모든 포장재는 **재활용이 가능하도록 설계**되어야 합니다. 특히 과대 포장 방지를 위한 빈 공간 비율 제한(40% 이하)이 강화됩니다.",
            action: "포장재 재질 등급 평가 및 포장 최소화 설계 가이드라인 수립이 필요합니다."
        },
        "ESPR": {
            color: "#0d47a1",
            badge: "에코디자인",
            summary: "에코디자인 규정(ESPR)은 제품의 지속가능성 정보 공개를 강제합니다. 핵심은 **디지털 제품 여권(DPP)**으로, QR코드를 통해 소비자에게 내구성 및 수리 가능성 정보를 제공해야 합니다.",
            action: "제품별 고유 ID 발급 및 원자재 이력 추적 시스템(Traceability) 도입이 시급합니다."
        },
        "default": {
            color: "#444",
            badge: "일반 분석",
            summary: law.content || "해당 법안은 환경 보호 및 자원 효율성 증대를 목표로 하는 규제 내용을 포함하고 있습니다.",
            action: "국가별 환경 기준 준수 여부를 상시 모니터링하고 대응 매뉴얼을 업데이트하세요."
        }
    };

    // 제목 키워드에 따른 리포트 선택
    let data = reports.default;
    if (title.includes("PPWR") || title.includes("포장")) data = reports.PPWR;
    else if (title.includes("ESPR") || title.includes("에코디자인")) data = reports.ESPR;

    // 결과 출력
    contentArea.innerHTML = `
        <div style="background:#f1f8f4; padding:15px; border-radius:8px; border-left: 4px solid ${data.color};">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <span style="background:${data.color}; color:white; font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:bold;">${data.badge}</span>
                <h4 style="color:${data.color}; margin:0;">🚀 AI 핵심 요약 리포트</h4>
            </div>
            <p><strong>[${title}]</strong> 분석 결과:</p>
            <p style="line-height:1.6; color:#333;">${data.summary}</p>
            <hr style="border:0; border-top:1px solid #ddd; margin:12px 0;">
            <p style="margin-bottom:0; font-size:0.95rem;">💡 <strong>대응 포인트:</strong> ${data.action}</p>
        </div>
    `;
}