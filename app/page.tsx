import Image from "next/image";
import card from "@/public/mastercard.png";
import puce from "@/public/puce.png";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-[470px] max-w-[98%] h-[280px] bg-gradient-to-t to-[#E42C66] from-[#F55B46] rounded-2xl p-8 relative overflow-hidden">
        <div className="h-[150px] w-[280px] absolute bg-black rounded-[50%] rotate-[17deg] -top-[35px] -right-[50px] opacity-10">

        </div>
        <div className="h-[150px] w-[280px] absolute bg-black rounded-[50%] rotate-[19deg] -bottom-[35px] -left-[50px] opacity-10">

        </div>
        <div className="w-[100%] relative flex justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-white">Current Balance</p>
            <p className="text-3xl text-white"> &euro; 5696.25</p>
          </div>
          <div className="">
            <Image
              src={card}
              alt="Credit Card"
              width={70}
            />
          </div>
        </div>
        <div className="w-[87%] absolute bottom-5 flex justify-between">
          <div className="flex flex-col gap-1">
          <Image
              src={puce}
              alt="puce card"
              width={70}
            />
          <p className="text-xl text-white">5282 3456 7890 1289</p>
          </div>
         <div className="self-end flex flex-col gap-2">
         <p className=" text-white">526</p>
         <p className=" text-white">09/28</p>
         </div>
        </div>
      </div>
    </main>
  );
}
