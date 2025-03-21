import Image from "next/image";

export default function Home() {
  return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-100">
          <div className="w-[500px] h-[500px]">
            <Image
                className="rounded-lg"
                src="/images/wherecar_logo2.png"
                width={500}
                height={500}
                alt="어디카!"
            />
          </div>
          <div className="w-[500px] h-[100px] flex justify-center items-center gap-2 flex-col bg-gray-200 rounded-lg">
            <p className="text-4xl font-bold">🚘 어디카?</p>
            <p className="text-lg text-slate-400">환영합니다, 기본 배포용 사이트입니다.</p>
          </div>
          <div>
            <p></p>
          </div>
        </div>
      </>
  );
}