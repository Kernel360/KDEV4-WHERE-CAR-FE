"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/lib/authStore';
import Head from 'next/head';

export default function HomePage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 스크롤 애니메이션을 위한 상태와 참조
  const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(null);
  const animatedElementsRef = useRef<{[key: string]: HTMLElement}>({});

  // 로딩 애니메이션을 위한 상태 설정
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Intersection Observer 초기화
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-aos-id');
          if (id && entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.classList.add('animated');
            // 한번 애니메이션을 실행한 후에는 관찰 중지
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // 요소의 10%가 화면에 들어왔을 때 트리거
      }
    );

    setIntersectionObserver(observer);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 애니메이션 요소 등록
  const registerAnimatedElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element && intersectionObserver) {
      animatedElementsRef.current[id] = element;
      element.setAttribute('data-aos-id', id);
      intersectionObserver.observe(element);
    }
  }, [intersectionObserver]);

  // 마우스 움직임에 따른 효과를 위한 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 로그인 되어 있으면 대시보드로 리다이렉션
  useEffect(() => {
    const isAuthed = useAuthStore.getState().checkAuth();
    
    if (isAuthed) {
      router.push('/dashboard');
    }
  }, [router]);

  // 애니메이션 지연 시간을 위한 헬퍼 함수
  const getDelayClass = (index: number) => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
    return delays[index % delays.length];
  };

  return (
    <div className={`min-h-screen ${currentTheme.background} flex flex-col`}>
      <Head>
        <title>WHERE CAR - 기업용 차량 관리 솔루션</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 헤더 */}
      <header className={`${currentTheme.cardBg} shadow-sm border-b ${currentTheme.border} fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className={`text-2xl font-bold ${currentTheme.text} transition-colors hover:text-blue-600`}>WHERE CAR</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-md border ${currentTheme.border} ${currentTheme.text} hover:${currentTheme.hoverBg} transition-colors`}
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow pt-16">
        {/* 히어로 섹션 */}
        <div 
          ref={heroRef}
          className="relative bg-gradient-to-r from-blue-800 to-indigo-900 text-white overflow-hidden flex items-center"
          style={{ minHeight: '85vh' }}
        >
          {/* 움직이는 배경 효과 */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute -inset-[10%] opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, transparent 70%)',
                width: '120%',
                height: '120%',
                transform: `translate(${-10 + mousePosition.x * 15}px, ${-10 + mousePosition.y * 15}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            ></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-repeat"></div>
              </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 flex flex-col lg:flex-row items-center justify-between">
            <div className={`text-left max-w-2xl mb-10 lg:mb-0 ${isLoaded ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              >
                기업용 차량 관리의<br/>
                <span className="text-blue-300">새로운 패러다임</span>
              </h2>
              <p 
                className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed"
              >
                WHERE CAR는 GPS 기반의 정밀한 위치 추적과 AI를 활용한 자동화된 운행 기록 관리 시스템으로, 기업의 차량 관리 비용을 최대 30% 절감해 드립니다.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <Link
                  href="/trial"
                  className="px-8 py-3 text-lg rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-all duration-300 shadow-md inline-block font-medium"
                >
                  무료 체험하기
                </Link>
                <Link
                  href="/emulator-guide"
                  className="px-8 py-3 text-lg rounded-md bg-blue-500/20 border border-blue-200/30 text-blue-100 hover:bg-blue-400/30 transition-all duration-300 shadow-md inline-block font-medium backdrop-blur-sm"
                >
                  애뮬레이터 가이드
                </Link>
              </div>
            </div>
            <div className={`relative ${isLoaded ? 'animate-fadeInRight' : 'opacity-0'} hidden lg:block`}>
              <div className="w-[450px] h-[450px] rounded-full bg-blue-700/20 backdrop-blur-xl p-6 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
                <div className="absolute h-full w-full rounded-full border border-blue-300/10"></div>
                <div className="absolute top-4 left-4 right-4 bottom-4 rounded-full border border-blue-300/20 animate-pulse-slow"></div>
                
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute top-0 -right-6 w-[150px] h-[150px] rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm animate-float"></div>
                  <div className="absolute -bottom-8 -left-8 w-[180px] h-[180px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm animate-float-delayed"></div>
                  
                  <div className="relative z-10 w-[240px] h-[240px] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 backdrop-blur-md animate-pulse-slow"></div>
                    <div className="text-3xl md:text-4xl font-bold text-white text-center">
                      WHERE<br/>CAR
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-10 -right-6 px-4 py-2.5 bg-blue-900/80 backdrop-blur-sm rounded-full text-white text-sm animate-pulse-slow shadow-lg border border-blue-700/50 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                  실시간 위치 추적
                </div>
                <div className="absolute bottom-14 -left-6 px-4 py-2.5 bg-indigo-900/80 backdrop-blur-sm rounded-full text-white text-sm animate-pulse-slow-delay shadow-lg border border-indigo-700/50 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                  운행 기록 자동화
                </div>
                <div className="absolute top-1/2 transform -translate-y-1/2 -right-12 px-4 py-2.5 bg-purple-900/80 backdrop-blur-sm rounded-full text-white text-sm animate-pulse-slow-delay2 shadow-lg border border-purple-700/50 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                  데이터 분석
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* 주요 가치 제안 섹션 */}
          <div 
            className={`mb-32 fade-up`}
            ref={(el) => registerAnimatedElement('value-section', el)}
          >
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium tracking-wide mb-3">핵심 가치</span>
              <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-5`}>
                WHERE CAR가 제공하는 가치
              </h2>
              <div className="w-20 h-1 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-5"></div>
              <p className={`${currentTheme.subtext} max-w-3xl mx-auto text-lg leading-relaxed`}>
                최첨단 기술을 활용한 WHERE CAR 솔루션으로 귀사의 차량 관리 시스템을 혁신하세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: '효율적인 리소스 활용',
                  description: '실시간 차량 모니터링으로 불필요한 운행을 줄이고 연료 비용을 최대 30%까지 절감하세요. 리소스 최적화를 통해 운영 효율성을 극대화합니다.',
                  color: 'from-blue-500 to-blue-600',
                  shadow: 'shadow-blue-100'
                },
                {
                  title: '데이터 기반 의사결정',
                  description: '차량 운행 데이터를 분석하여 비용 절감 방안과 효율적인 경로를 제안합니다. 데이터 기반의 의사결정으로 경영 투명성을 향상시킵니다.',
                  color: 'from-indigo-500 to-indigo-600',
                  shadow: 'shadow-indigo-100'
                },
                {
                  title: '규정 준수 자동화',
                  description: '운행 일지 자동 생성과 업무용/개인용 운행 구분으로 세금 처리와 감사에 필요한 문서를 자동으로 관리하여 법적 리스크를 최소화합니다.',
                  color: 'from-green-500 to-green-600',
                  shadow: 'shadow-green-100'
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`group rounded-2xl ${currentTheme.cardBg} shadow-xl ${item.shadow} transition-all duration-300 hover:translate-y-[-8px] overflow-hidden fade-up`}
                  ref={(el) => registerAnimatedElement(`value-card-${index}`, el)}
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${item.color}`}></div>
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {index + 1}
                      </div>
                      <h3 className={`text-xl font-bold ${currentTheme.text} ml-4 group-hover:text-blue-600 transition-colors`}>{item.title}</h3>
              </div>
                    <p className={`${currentTheme.subtext} leading-relaxed`}>
                      {item.description}
                    </p>
              </div>
              </div>
              ))}
            </div>
          </div>

          {/* 신뢰성 섹션 */}
          <div 
            className={`mb-32 fade-up`}
            ref={(el) => registerAnimatedElement('reliability-section', el)}
          >
            <div className={`rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden relative shadow-xl`}>
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-300/20 transform translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tl from-indigo-300/20 to-purple-300/20 transform -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
              
              <div className="relative z-10 p-12 md:p-16">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div 
                    className="md:w-2/3 mb-10 md:mb-0 md:pr-12 fade-right"
                    ref={(el) => registerAnimatedElement('reliability-content', el)}
                  >
                    <h3 className={`text-3xl font-bold text-blue-900 mb-5`}>
                      전문가가 검증한 엔터프라이즈급 솔루션
                    </h3>
                    <p className={`text-blue-800/70 mb-8 text-lg leading-relaxed`}>
                      WHERE CAR는 국내 최고의 차량 관리 전문가들이 개발한 솔루션으로, 이미 100개 이상의 기업들이 신뢰하고 있습니다. 
                      업계 최고 수준의 보안 기술과 안정적인 인프라로 귀사의 차량 관리를 완벽하게 지원합니다.
                    </p>
                    <div 
                      className="flex flex-wrap gap-6 fade-up"
                      ref={(el) => registerAnimatedElement('reliability-stats', el)}
                    >
                      {[
                        { label: '고객 만족도', value: '98%' },
                        { label: '연간 비용 절감', value: '30%+' },
                        { label: '서비스 안정성', value: '99.9%' }
                      ].map((stat, idx) => (
                        <div 
                          key={idx} 
                          className={`px-5 py-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-md border border-blue-100`}
                        >
                          <div className="text-2xl font-bold text-blue-700">{stat.value}</div>
                          <div className="text-sm text-blue-900/60 font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div 
                    className="md:w-1/3 flex justify-center fade-left"
                    ref={(el) => registerAnimatedElement('reliability-badge', el)}
                  >
                    <div className="relative">
                      <div className="w-56 h-56 rounded-full bg-gradient-to-r from-blue-200/80 to-indigo-200/80 backdrop-blur flex items-center justify-center shadow-xl border border-white/50">
                        <div className="text-2xl font-bold text-blue-800 text-center">
                          검증된<br/>기업 솔루션
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-r from-blue-400/60 to-indigo-400/60 backdrop-blur-sm animate-float-delayed"></div>
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400/60 to-purple-400/60 backdrop-blur-sm animate-float"></div>
            </div>
              </div>
              </div>
              </div>
            </div>
          </div>

          {/* 사용법 섹션 */}
          <div 
            className={`mb-32 fade-up`}
            ref={(el) => registerAnimatedElement('usage-section', el)}
          >
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium tracking-wide mb-3">간편한 사용법</span>
              <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-5`}>
                WHERE CAR 시작하기
              </h2>
              <div className="w-20 h-1 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-5"></div>
              <p className={`${currentTheme.subtext} max-w-3xl mx-auto text-lg leading-relaxed`}>
                WHERE CAR는 몇 가지 간단한 단계만으로 여러분의 차량 관리 시스템을 혁신합니다
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* 연결선 */}
              <div className="hidden md:block absolute top-28 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-full z-0 scale-line"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                {[
                  {
                    step: '1',
                    title: '차량 단말 설치',
                    description: '전문 기술자가 귀사의 모든 차량에 GPS 및 IoT 단말기를 설치합니다.',
                    color: 'from-blue-500 to-blue-600'
                  },
                  {
                    step: '2',
                    title: '차량 등록',
                    description: '웹 또는 모바일 앱에서 차량 정보를 등록하고 필요한 설정을 완료합니다.',
                    color: 'from-indigo-500 to-indigo-600'
                  },
                  {
                    step: '3',
                    title: '실시간 모니터링',
                    description: '설치 완료 즉시 모든 차량의 실시간 위치 추적 및 데이터 수집이 시작됩니다.',
                    color: 'from-purple-500 to-purple-600'
                  },
                  {
                    step: '4',
                    title: '데이터 분석',
                    description: '축적된 데이터를 기반으로 비용 절감 및 효율화 방안을 제공받습니다.',
                    color: 'from-green-500 to-green-600'
                  }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`relative z-10 fade-up`}
                    ref={(el) => registerAnimatedElement(`step-card-${index}`, el)}
                  >
                    <div className={`${currentTheme.cardBg} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center relative overflow-hidden group`}>
                      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${item.color} opacity-10 transition-opacity duration-300 group-hover:opacity-20`}></div>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-2xl font-bold mt-8 mb-4 shadow-lg relative z-10`}>
                        {item.step}
                      </div>
                      <h3 className={`${currentTheme.text} text-xl font-bold mb-3 text-center relative z-10`}>{item.title}</h3>
                      <p className={`${currentTheme.subtext} text-center px-6 pb-8 flex-grow relative z-10`}>{item.description}</p>
                    </div>
              </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA 섹션 */}
          <div 
            className={`fade-up`}
            ref={(el) => registerAnimatedElement('cta-section', el)}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 bg-repeat mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-400/30 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tl from-indigo-400/30 to-purple-400/30 blur-3xl"></div>
              
              <div className="relative z-10 p-16 md:p-20 flex flex-col items-center text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                  지금 바로 시작하세요
                </h3>
                <p className="text-blue-100 mb-12 max-w-2xl text-lg leading-relaxed">
                  14일 무료 체험 기간 동안 WHERE CAR의 모든 기능을 경험해보세요.
                  설치부터 운영까지 전문 컨설턴트가 함께합니다.
                </p>
                <div 
                  className="flex flex-col sm:flex-row gap-4 fade-up"
                  ref={(el) => registerAnimatedElement('cta-button', el)}
                >
                  <Link
                    href="/register"
                    className="px-10 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-xl hover:shadow-2xl text-lg font-medium group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/30 to-blue-100/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative z-10">무료로 시작하기</span>
              </Link>
            </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className={`${currentTheme.cardBg} border-t ${currentTheme.border} py-10 mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col mb-6 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-3">
                <h2 className={`text-xl font-bold ${currentTheme.text}`}>WHERE CAR</h2>
              </div>
              <div className={`text-center md:text-left ${currentTheme.subtext} text-sm`}>
                &copy; 2023 WHERE CAR. All rights reserved.
              </div>
            </div>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-8">
              <div className="flex flex-col space-y-2">
                <h4 className={`${currentTheme.text} font-semibold text-sm mb-1`}>바로가기</h4>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>홈</a>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>서비스 소개</a>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>요금제</a>
              </div>
              <div className="flex flex-col space-y-2">
                <h4 className={`${currentTheme.text} font-semibold text-sm mb-1`}>법적 정보</h4>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>이용약관</a>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>개인정보처리방침</a>
                <a href="#" className={`${currentTheme.subtext} hover:${currentTheme.text} transition-colors text-sm`}>문의하기</a>
          </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS 애니메이션 정의 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleX {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse-slow {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes pulse-slow-delay {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @keyframes pulse-slow-delay2 {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        /* 스크롤 애니메이션 클래스 */
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-right {
          opacity: 0;
          transform: translateX(-30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-left {
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .scale-line {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1.5s ease-out;
        }
        
        /* 애니메이션 실행 클래스 */
        .animated.fade-up {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animated.fade-right {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animated.fade-left {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animated.scale-line {
          transform: scaleX(1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-scaleX {
          animation: scaleX 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 4s ease-in-out infinite 1s;
        }
        
        .animate-pulse-slow-delay2 {
          animation: pulse-slow-delay2 4s ease-in-out infinite 2s;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
      </div>
  );
} 