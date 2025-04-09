/** @type {import('next').NextConfig} */
const nextConfig = {
  // 환경 변수 설정
  env: {
    // 여기에 클라이언트에 노출될 환경 변수를 명시적으로 설정할 수 있습니다.
    // NEXT_PUBLIC_ 접두사가 있는 환경 변수는 자동으로 클라이언트에 노출됩니다.
  },
  
  // CORS 설정 (필요한 경우)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
