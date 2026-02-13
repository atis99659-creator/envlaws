-- 기존 데이터 초기화
DELETE FROM law;

INSERT INTO law (category, title, content, original_text, country) VALUES
-- 1. 중국 (global-china)
('global-china', '중국 환경보호법', '중국의 환경 관리 체계와 기업 환경 책임을 규정한 기본법입니다.', '/EnvLaw hub/china/china_env/china_env.pdf', 'CN'),
('global-china', '고체폐기물 오염방지법', '산업 및 생활 폐기물의 발생 억제와 적정 처리를 규제합니다.', '/EnvLaw hub/china/china_waste/china_waste.pdf', 'CN'),

-- 2. 유럽 (global-eu)
('global-eu', '탄소국경조정제도 (CBAM)', 'EU로 수입되는 제품의 탄소 배출량에 비용을 부과하는 제도입니다.', '/EnvLaw hub/eu/cbam/cbam.pdf', 'EU'),
('global-eu', '공급망 실사 지침 (CSDDD)', '기업의 전 공급망 내 인권 및 환경 실사를 의무화합니다.', '/EnvLaw hub/eu/csddd/csddd.pdf', 'EU'),
('global-eu', '포장 및 포장폐기물 규정 (PPWR)', '포장재 쓰레기 차단 및 재활용 가능한 순환체계 강화유도.', '/EnvLaw hub/eu/ppwr/ppwr.pdf', 'EU'),
('global-eu', '에코디자인 규정 (ESPR)', '제품별로 디지털 신분증 부착을 의무화하는 제도입니다..', '/EnvLaw hub/eu/espr/espr.pdf', 'EU'),
-- 3. 일본 (global-japan)
('global-japan', '지구온난화 대책 추진법', '온실가스 배출 억제를 위한 정부와 지자체의 책무를 다룹니다.', '/EnvLaw hub/japan/japan_earth/japan_earth.pdf', 'JP'),
('global-japan', '플라스틱 자원순환 촉진법', '플라스틱 제품의 설계부터 폐기까지 전 과정의 순환을 촉진합니다.', '/EnvLaw hub/japan/japan_plastic/japan_plastic.pdf', 'JP'),

-- 4. 한국 - 기후위기 및 에너지 (domestic-climate)
('domestic-climate', '탄소중립기본법', '2050 탄소중립 달성을 위한 국가 비전과 이행 체계를 규정합니다.', '/EnvLaw hub/korea/korea_climate/korea_climate.pdf', 'KR'),

-- 5. 한국 - 자원순환 및 폐기물 (domestic-resource)
('domestic-resource', '순환자원경제법', '자원의 효율적 이용과 폐기물 발생 억제를 통한 순환 경제 구현을 목표로 합니다.', '/EnvLaw hub/korea/korea_resources/korea_resources.pdf', 'KR');

-- [참고] 아직 데이터가 없는 카테고리(USA, 대기/수질 등)는 index.html에서 클릭 시 빈 목록이 나오는 것이 정상입니다.