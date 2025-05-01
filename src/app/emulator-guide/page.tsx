'use client';

import { useTheme } from "@/contexts/ThemeContext";

export default function EmulatorGuidePage() {
  const { currentTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${currentTheme.text}`}>
          애뮬레이터 가이드
        </h1>
        
        <div className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. 애뮬레이터란?</h3>
              <p className={`${currentTheme.mutedText} mb-4`}>
                WHERE CAR 애뮬레이터는 실제 차량의 GPS 데이터를 시뮬레이션하여 
                시스템의 실시간 추적 기능을 테스트할 수 있게 해주는 도구입니다.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. 사용 방법</h3>
              <div className={`${currentTheme.mutedText} space-y-2`}>
                <p>① 로그인 후 실시간 관제 페이지로 이동합니다.</p>
                <p>② 애뮬레이터 시작 버튼을 클릭합니다.</p>
                <p>③ 원하는 차량과 경로를 선택합니다.</p>
                <p>④ 시뮬레이션을 시작하여 실시간으로 차량 이동을 확인합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. 주요 기능</h3>
              <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-2`}>
                <li>다중 차량 시뮬레이션</li>
                <li>실시간 위치 업데이트</li>
                <li>사용자 정의 경로 설정</li>
                <li>속도 조절 기능</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. 주의사항</h3>
              <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-2`}>
                <li>테스트 목적으로만 사용해주세요.</li>
                <li>실제 운행 데이터와 구분하여 관리됩니다.</li>
                <li>과도한 사용은 시스템 성능에 영향을 줄 수 있습니다.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 