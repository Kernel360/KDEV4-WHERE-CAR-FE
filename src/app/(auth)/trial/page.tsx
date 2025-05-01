'use client';

import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrialPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();

  const emulators = [
    {
      url: 'https://emulator.where-car.com:8080/dashboard',
      vehicleId: '01284967350',
      plateNo: '23마8492',
      description: '광주 → 무주 경로'
    },
    {
      url: 'https://emulator.where-car.com:8081/dashboard',
      vehicleId: '09573482619',
      plateNo: '67다1359',
      description: '경주 → 서울 경로'
    },
    {
      url: 'https://emulator.where-car.com:8082/dashboard',
      vehicleId: '03759261845',
      plateNo: '12고9756',
      description: '서울 → 경주 경로'
    },
    {
      url: 'https://emulator.where-car.com:8083/dashboard',
      vehicleId: '07362519840',
      plateNo: '89버2431',
      description: '수원 → 대전 → 구미 경로'
    },
    {
      url: 'https://emulator.where-car.com:8084/dashboard',
      vehicleId: '05829463715',
      plateNo: '35자7650',
      description: '양양 → 대구 경로'
    }
  ];

  return (
    <div className={`min-h-screen ${currentTheme.background} p-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className={`p-2 rounded-full hover:${currentTheme.hoverBg} transition-colors`}
            aria-label="뒤로 가기"
          >
            <ArrowLeftIcon className={`h-6 w-6 ${currentTheme.text}`} />
          </button>
          <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
            WHERE CAR 체험하기
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 데모 계정 로그인 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-7`}>
            <h2 className="text-2xl font-bold mb-5 text-blue-500">데모 계정으로 시작하기</h2>
            <p className={`${currentTheme.mutedText} mb-5`}>
              WHERE CAR의 모든 기능을 체험해보세요. 아래 데모 계정으로 로그인하실 수 있습니다.
            </p>
            <div className={`${currentTheme.hoverBg} rounded-lg p-5 mb-5 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`${currentTheme.text}`}>이메일 주소:</span>
                <code className={`${currentTheme.cardBg} px-3 py-1.5 rounded text-blue-600 dark:text-blue-400`}>
                  user@example.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${currentTheme.text}`}>비밀번호:</span>
                <code className={`${currentTheme.cardBg} px-3 py-1.5 rounded text-blue-600 dark:text-blue-400`}>
                  123
                </code>
              </div>
            </div>
            <Link
              href="/login"
              className="w-full block text-center px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-5"
            >
              로그인하러 가기
            </Link>
            
            {/* 알림 박스를 로그인 버튼 아래로 이동 */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mt-4">
              <p className={`${currentTheme.mutedText}`}>
                💡 에뮬레이터를 통해 실제 차량의 움직임을 시뮬레이션해볼 수 있습니다. <br />
                해당 애뮬레이터를 실행하면 where-car.com 관제 페이지에 실시간 추적 데이터가 표시됩니다.
              </p>
            </div>
          </section>

          {/* 에뮬레이터 체험 섹션 */}
          <section className={`${currentTheme.cardBg} rounded-lg shadow-lg p-7 relative`}>
            <h2 className="text-2xl font-bold mb-5 text-blue-500">에뮬레이터 체험하기</h2>
            <p className={`${currentTheme.mutedText} mb-5`}>
              실제 차량의 이동을 시뮬레이션하는 에뮬레이터를 체험해보세요.
              해당 애뮬레이터를 작동하면 where-car.com 관제 페이지에 실시간 추적 데이터가 표시됩니다.
            </p>
            <div className="space-y-4 mb-8">
              {emulators.map((emulator, index) => (
                <div 
                  key={index}
                  className={`${currentTheme.hoverBg} rounded-lg p-4 border ${currentTheme.border} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-500">{emulator.description}</h3>
                    <a 
                      href={emulator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      체험하기
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`${currentTheme.mutedText}`}>차량 ID:</span>
                      <code className={`${currentTheme.cardBg} px-3 py-1.5 rounded`}>{emulator.vehicleId}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${currentTheme.mutedText}`}>차량 번호:</span>
                      <code className={`${currentTheme.cardBg} px-3 py-1.5 rounded`}>{emulator.plateNo}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

           
          </section>
        </div>
        
      </div>
    </div>
  );
} 