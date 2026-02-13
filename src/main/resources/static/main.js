/**
 * EnvLaw Hub 통합 비즈니스 로직 (v2.2)
 * - 데이터 로딩 (404 대응)
 * - PDF 경로 인코딩 및 뷰어 로드
 * - 상세 모달 드래그(Drag & Drop) 기능
 * - 법안별 기업 준수사항 체크리스트 (로컬 저장)
 * - AI 분석 리포트 및 챗봇 인터페이스
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
        const pdfWrapper = document.getElementById('pdfWrapper');
        const rawPath = law.original_text || law.originalText;

        if (rawPath) {
            const encodedPath = encodeURI(rawPath);
            const fullPath = window.location.origin + encodedPath;
            pdfWrapper.innerHTML = `<iframe src="${fullPath}" width="100%" height="100%" style="border:none;"></iframe>`;
        } else {
            pdfWrapper.innerHTML = `<div style="padding:20px; color:white; text-align:center;">PDF 파일을 찾을 수 없습니다.</div>`;
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

        // 분석창 초기화
        document.getElementById('translationContainer').style.display = 'none';
        document.getElementById('btnTranslate').innerHTML = '<i class="fas fa-language"></i> 한국어로 번역/AI 분석';

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

    /* --- [A] 데이터 로딩 (bills.html 전용) --- */
    const dataContainer = document.getElementById('dataContainer');
    if (type && dataContainer) {
        const apiUrl = `/api/laws/${type}`; // 404 발생 시 서버 설정에 따라 /api/laws?type=${type} 로 변경 검토

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

    /* --- [B] 모달 드래그(Drag) 로직 복구 --- */
    const modalFull = document.querySelector('.modal-content.detail-full');
    const dragHeader = document.querySelector('.detail-header');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    if (dragHeader && modalFull) {
        dragHeader.style.cursor = 'move'; // 드래그 가능 커서 표시

        dragHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = modalFull.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            modalFull.style.transition = 'none'; // 드래그 중 애니메이션 끄기
            modalFull.style.transform = 'none';   // 중심축 보정 제거 (좌표 직접 제어)
            modalFull.style.left = rect.left + 'px';
            modalFull.style.top = rect.top + 'px';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            modalFull.style.left = (e.clientX - offset.x) + 'px';
            modalFull.style.top = (e.clientY - offset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /* --- [C] UI 인터랙션 (닫기, 번역 토글, 챗봇) --- */
    // 모달 닫기
    const closeBtn = document.querySelector('.close-detail');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('lawDetailModal').style.display = 'none';
            document.getElementById('pdfWrapper').innerHTML = ""; // PDF 로드 중단
            document.body.style.overflow = 'auto';
        };
    }

    // 번역/AI 분석 토글
    const btnTrans = document.getElementById('btnTranslate');
    if (btnTrans) {
        btnTrans.onclick = () => {
            const container = document.getElementById('translationContainer');
            if (container.style.display === 'none') {
                container.style.display = 'flex';
                btnTrans.innerHTML = '<i class="fas fa-times"></i> 분석창 닫기';
                loadTranslation();
            } else {
                container.style.display = 'none';
                btnTrans.innerHTML = '<i class="fas fa-language"></i> 한국어로 번역/AI 분석';
            }
        };
    }

    // 메인 페이지(index.html) 카테고리 클릭 이동
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
        const chatInput = document.getElementById('chatInput');
        const history = document.getElementById('chatHistory');

        if (!chatInput.value.trim()) return;

        const userVal = chatInput.value;
        // 1. 사용자가 입력한 메시지 화면에 표시
        history.innerHTML += `<div class="user-msg">${userVal}</div>`;
        chatInput.value = "";
        history.scrollTop = history.scrollHeight;

        // 2. AI가 생각 중이라는 표시 (로딩 메시지)
        const loadingId = "loading-" + Date.now();
        history.innerHTML += `<div class="ai-msg" id="${loadingId}">Gemini가 분석 중입니다...</div>`;
        history.scrollTop = history.scrollHeight;

        try {
            // 3. 백엔드(Spring Boot)의 GeminiController로 요청 전송
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userVal }) // ChatRequest 규격에 맞춤
            });

            if (!response.ok) throw new Error("서버 응답 오류");

            const data = await response.json();

            // 4. 로딩 메시지를 실제 AI 답변으로 교체
            document.getElementById(loadingId).innerText = data.answer;
        } catch (err) {
            console.error("AI 연동 에러:", err);
            document.getElementById(loadingId).innerText = "죄송합니다. AI 서비스와 연결할 수 없습니다.";
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
    checks.forEach(c => {
        if (c.checked) checkedIndices.push(parseInt(c.dataset.idx));
    });
    localStorage.setItem(`checklist_${lawId}`, JSON.stringify(checkedIndices));
}

/**
 * 5. [기능] AI 분석 리포트 생성
 */
function loadTranslation() {
    const title = document.getElementById('modalTitle').innerText;
    document.getElementById('translationContent').innerHTML = `
        <div style="background:#f1f8f4; padding:15px; border-radius:8px; border-left: 4px solid #1a7431;">
            <h4 style="color:#1a7431; margin-top:0;">🚀 AI 핵심 요약 리포트</h4>
            <p><strong>[${title}]</strong> 분석 결과:</p>
            <p>이 규제는 귀사의 제품 수출 시 탄소 배출량 공시를 강제하는 항목을 포함하고 있습니다. 체크리스트를 확인하여 대응하세요.</p>
        </div>
    `;
}