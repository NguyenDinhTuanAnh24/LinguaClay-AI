import React from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import Image from 'next/image'
import { Target, Lightbulb, Users, Globe, BookOpen, User, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="w-full bg-transparent overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
             VỀ LINGUACLAY
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-newsprint-black mb-8 uppercase leading-tight tracking-tight vietnamese-text">
            Sứ mệnh xóa bỏ<br />Rào cản ngôn ngữ
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
            Từ một ý tưởng nhỏ trong phòng tự học, đến nền tảng ngôn ngữ AI thay đổi cách hàng ngàn người giao tiếp mỗi ngày.
          </p>
        </div>
      </section>

      {/* 2. Câu chuyện khởi đầu */}
      <section className="w-full border-b-[3px] border-newsprint-black py-16 sm:py-24 bg-transparent overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Câu chuyện<br />Bắt đầu
            </h2>
            <div className="h-[3px] w-24 bg-newsprint-black mb-8"></div>
            <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark mb-6 leading-relaxed vietnamese-text">
              Vài năm trước, chúng tôi nhận ra một sự thật cay đắng: Hàng triệu người bỏ ra hàng năm trời để học ngoại ngữ ở trường lớp, nhưng khi đối diện với người nước ngoài, họ đứng hình và không thốt nên lời.
            </p>
            <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text">
              LinguaClay ra đời để phá vỡ vòng lặp đó. Chúng tôi muốn tạo ra một môi trường luyện tập 24/7, nơi bạn không sợ bị đánh giá, được phản hồi ngay lập tức, và học cách ngôn ngữ thực sự hoạt động trong đời sống thực tế thông qua AI và khoa học nhận thức.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-newsprint-black translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 border-[3px] border-newsprint-black transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <div className="w-full aspect-[4/3] bg-newsprint-paper border-[3px] border-newsprint-black relative flex items-center justify-center overflow-hidden">
              {/* Illustration Placeholder or Image */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-48 h-48 border-[3px] rounded-full border-newsprint-black animate-[spin_10s_linear_infinite]"></div>
              </div>
              <Lightbulb className="w-24 h-24 text-newsprint-black grayscale mix-blend-multiply relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sứ mệnh & Tầm nhìn (2 cột) */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="border-[3px] border-newsprint-black grid grid-cols-1 md:grid-cols-2 bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Mission */}
            <div className="p-10 lg:p-16 border-b-[3px] md:border-b-0 md:border-r-[3px] border-newsprint-black group hover:bg-newsprint-black hover:text-newsprint-white transition-colors duration-300">
              <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-newsprint-black vietnamese-text">SỨ MỆNH HIỆN TẠI</h3>
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text group-hover:text-newsprint-white">Trao quyền giao tiếp</h2>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark group-hover:text-newsprint-gray-medium leading-relaxed vietnamese-text">
                Cung cấp cho mỗi cá nhân một môi trường học tập cá nhân hóa, áp dụng trí tuệ nhân tạo để mô phỏng 100% ngữ cảnh thực tiễn, giúp người học chuyển hóa kiến thức từ giấy trang sang phản xạ thực chiến.
              </p>
            </div>
            {/* Vision */}
            <div className="p-10 lg:p-16 group hover:bg-newsprint-black hover:text-newsprint-white transition-colors duration-300">
              <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-newsprint-black vietnamese-text">TẦM NHÌN TƯƠNG LAI</h3>
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text group-hover:text-newsprint-white">Công dân toàn cầu</h2>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark group-hover:text-newsprint-gray-medium leading-relaxed vietnamese-text">
                Xây dựng một hệ sinh thái giáo dục ngôn ngữ hàng đầu, nơi bất kì một ai có mãnh mút Internet đều có cơ hội trở thành công dân toàn cầu với sự lưu loát ngôn ngữ thứ hai một cách trọn vẹn nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Con số nổi bật */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-newsprint-black text-newsprint-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y divide-newsprint-gray-dark/50 md:divide-y-0 md:divide-x">
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-4 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">10k+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Học viên tích cực</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">5M+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Flashcard đã lật</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">3</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Ngôn ngữ hỗ trợ</div>
          </div>
          <div className="flex flex-col flex-1 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">4.8</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Điểm đánh giá / 5.0</div>
          </div>
        </div>
      </section>

      {/* 5. Đội ngũ */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 sm:py-32 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Đội Ngũ Xây Dựng
            </h2>
            <p className="text-lg font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
              Những con người đằng sau hệ thống LinguaClay, tận tâm mỗi ngày để mang lại trải nghiệm tối ưu nhất cho bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
            {/* Team Member 1 */}
            <div className="border-[3px] border-newsprint-black flex flex-col group bg-newsprint-white">
              <div className="w-full aspect-square border-b-[3px] border-newsprint-black overflow-hidden flex justify-center items-center">
                <User className="w-24 h-24 text-newsprint-gray-medium group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-black font-serif text-2xl uppercase text-newsprint-black vietnamese-text">Nguyễn Đình Tuấn Anh</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark mb-4 vietnamese-text">Founder & CEO</p>
                <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Kỹ sư AI và chuyên gia thiết kế trải nghiệm người dùng, biến các quy luật tâm lý thành giao diện sản phẩm, mong muốn kết nối thế giới lại với nhau.</p>
              </div>
            </div>
            {/* Team Member 2 */}
            <div className="border-[3px] border-newsprint-black flex flex-col group bg-newsprint-white">
              <div className="w-full aspect-square border-b-[3px] border-newsprint-black overflow-hidden flex justify-center items-center">
                <User className="w-24 h-24 text-newsprint-gray-medium group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-black font-serif text-2xl uppercase text-newsprint-black vietnamese-text">Nguyễn Đình Quang Anh</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark mb-4 vietnamese-text">Head of Content</p>
                <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Quản lý và tinh chỉnh thư viện giáo trình khổng lồ từ cơ bản đến nâng cao.</p>
              </div>
            </div>
            {/* Team Member 3 */}
            <div className="border-[3px] border-newsprint-black flex flex-col group sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 w-full sm:w-1/2 md:w-full bg-newsprint-white">
              <div className="w-full aspect-square border-b-[3px] border-newsprint-black overflow-hidden flex justify-center items-center">
                <User className="w-24 h-24 text-newsprint-gray-medium group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-black font-serif text-2xl uppercase text-newsprint-black vietnamese-text">Elena Vo</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark mb-4 vietnamese-text">Developer</p>
                <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Chuyên gia phát triển phần mềm, xây dựng nền tảng công nghệ cho LinguaClay.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Giá trị cốt lõi */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Giá trị cốt lõi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16 group/diff">
            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <BookOpen size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Khoa học & Thực chứng</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Mọi tính năng trên LinguaClay đều có cơ sở từ các báo cáo khoa học tâm lý và giáo dục học thần kinh hành vi.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Target size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Cá nhân hóa 1-1</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Không ai học giống nhau. Trí tuệ tự động AI định tuyến lại toàn bộ đường ống kiến thức dựa theo mức độ thông hiểu riêng của bạn.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Users size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Tự do tự chủ</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Quyền lực thuộc về bạn. Học ở bất kỳ đâu, bất kỳ lúc nào, nói về bất kỳ chủ đề gì mà bạn thấy thoải mái.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Cuối Trang */}
      <section className="w-full bg-transparent text-newsprint-black py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black leading-tight text-newsprint-black mb-8 vietnamese-text tracking-tight uppercase">
            Đồng hành cùng<br />Sứ mệnh ngôn ngữ
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Bắt đầu với 0 đồng, trải nghiệm nền tảng tiên tiến dẫn đầu kỉ nguyên giáo dục AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AuthTrigger tab="signin"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-black text-white font-bold uppercase tracking-widest border-[3px] border-black hover:bg-white hover:text-black transition-all duration-300 vietnamese-text text-sm flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              BẮT ĐẦU MIỄN PHÍ <ArrowRight className="w-4 h-4" />
            </AuthTrigger>
            <Link
              href="/product/pricing"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-transparent text-newsprint-black font-bold uppercase tracking-widest border-[3px] border-newsprint-black hover:bg-white transition-all duration-300 vietnamese-text text-sm text-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              XEM BẢNG GIÁ
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
