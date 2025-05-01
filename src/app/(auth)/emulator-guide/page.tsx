'use client';

import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmulatorGuidePage() {
  const { currentTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
            자동차 관제 에뮬레이터 가이드
          </h1>
        </div>
        
        <div className={`space-y-8 ${currentTheme.text}`}>
          {/* 개요 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-4">개요</h2>
            <p className={`${currentTheme.mutedText} leading-relaxed`}>
              이 에뮬레이터는 실제 차량에 장착하는 관제 장치의 기능을 웹 애플리케이션으로 구현한 소프트웨어입니다. 
              개발 및 테스트 환경에서 실제 장비 없이도 자동차의 위치와 상태를 효과적으로 시뮬레이션하고 검증할 수 있도록 설계되었습니다.
            </p>
          </section>

          {/* 주요 특징 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-6">주요 특징</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-500">웹 기반 애플리케이션</h3>
                <p className={`${currentTheme.mutedText}`}>별도의 설치 없이 웹 브라우저에서 바로 사용할 수 있습니다.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-500">반응형 인터페이스</h3>
                <p className={`${currentTheme.mutedText}`}>데스크탑, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면을 제공합니다.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-500">다크모드 지원</h3>
                <p className={`${currentTheme.mutedText}`}>사용자의 환경 및 취향에 맞춰 라이트/다크 테마를 자유롭게 전환할 수 있습니다.</p>
              </div>
            </div>
          </section>

          {/* 제공 모드 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-6">제공 모드</h2>
            
            {/* 시뮬레이션 모드 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-blue-500 mb-4">시뮬레이션 모드</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">기능 개요</h4>
                  <p className={`${currentTheme.mutedText}`}>
                    미리 제공된 GPX 파일(실제 한국 도로 기반 경로 데이터)을 활용하여 차량의 움직임을 시뮬레이션합니다.
                    1초마다 GPX 파일에서 위치 정보를 읽어와 실제 차량이 이동하는 것처럼 위치 정보를 갱신합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주요 기능</h4>
                  <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-1`}>
                    <li>GPX 파일을 불러와 경로를 시각적으로 표시</li>
                    <li>출발지와 도착지 정보를 명확하게 제공</li>
                    <li>실제 도로를 반영한 경로 데이터로 현실감 있는 테스트 가능</li>
                    <li>위치 정보가 1초 단위로 자동 갱신되어 실시간과 유사한 테스트 환경 제공</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 실시간 모드 */}
            <div>
              <h3 className="text-xl font-semibold text-blue-500 mb-4">실시간 모드</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">기능 개요</h4>
                  <p className={`${currentTheme.mutedText}`}>
                    GPS 모듈이 장착된 기기를 통해 사용자의 실제 위치 정보를 1초마다 수집하고 누적합니다.
                    실제 차량, 자전거, 도보 등 다양한 운송수단을 이용한 실시간 테스트가 가능합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주요 기능</h4>
                  <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-1`}>
                    <li>GPS 모듈이 있는 기기에서 1초마다 정확한 위치 정보 수집</li>
                    <li>실시간으로 위치 이동 경로를 지도에 표시</li>
                    <li>다양한 이동 수단 테스트 지원</li>
                    <li>위치 정보 누적 및 이동 경로 기록 기능 제공</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 추가 기능 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-6">추가 제공 기능</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-500 mb-3">GPX 파일 관리</h3>
                <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-1`}>
                  <li>다양한 GPX 파일을 업로드 및 관리 가능</li>
                  <li>경로별 테스트 시나리오 저장 및 불러오기 지원</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-500 mb-3">로그 및 기록 기능</h3>
                <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-1`}>
                  <li>위치 정보와 이동 경로를 기록</li>
                  <li>테스트 결과를 파일로 저장하거나 분석에 활용 가능</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 참고 사항 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-4">참고 사항</h2>
            <ul className={`${currentTheme.mutedText} list-disc list-inside space-y-2`}>
              <li>정확한 테스트를 위해 실시간 모드에서는 GPS 모듈이 장착된 장비 사용을 권장합니다.</li>
              <li>GPX 파일은 GPS 기반 경로 데이터로, 실제 도로 상황을 반영한 경로 시뮬레이션에 활용됩니다.</li>
              <li>IP 기반 위치 추적은 참고용으로만 사용하시고, 실제 서비스 품질 검증에는 GPS 기반 테스트를 권장합니다.</li>
            </ul>
          </section>

          {/* 데모 체험하기 버튼 섹션 추가 */}
          <div className="flex flex-col items-center py-8">
            <p className={`${currentTheme.mutedText} text-center mb-6 text-lg`}>
              지금 바로 WHERE CAR 에뮬레이터를 체험해보세요!
            </p>
            <Link
              href="/trial"
              className="inline-flex items-center px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <span className="text-lg font-semibold">데모 체험하기</span>
              <svg 
                className="w-5 h-5 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 