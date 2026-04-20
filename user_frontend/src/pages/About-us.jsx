import "../index.css"

export default function About() {
  return (
    <div className="about-container">

      {/* HERO */}
      <div className="about-hero">
        <div className="overlay"></div>
        <div className="about-content">
          <h1>
            Về <span>PitGo</span>
          </h1>
          {/* Chỉ giữ lại một slogan ngắn gọn trên ảnh nền */}
          <p className="hero-subtitle">
            Nền tảng kết nối toàn diện dành cho những người đam mê xe, nơi hội tụ của công nghệ, tốc độ và phong cách sống hiện đại.
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="about-body">
        
        {/* TEXT: Đưa nội dung giới thiệu chi tiết xuống đây */}
        <div className="about-text">
          <section className="about-section">
            <h3>Câu Chuyện Của Chúng Tôi</h3>
            <p>
              Khởi đầu của <strong>PitGo</strong> không đến từ những con số kinh doanh khô khan, mà bắt nguồn từ nhịp đập của những khối động cơ V12 và niềm khao khát chinh phục tốc độ của một nhóm anh em thân thiết. 
            </p>
            <p>
              Trước đây, chúng tôi cũng như bạn – liên tục tìm kiếm và trải nghiệm những siêu phẩm mới nhất vừa rời showroom. Tuy nhiên, sau nhiều năm "chinh chiến", chúng tôi nhận ra rằng việc sở hữu một chiếc siêu xe mới hoàn toàn đôi khi đi kèm với rào cản về sự khấu hao quá lớn và sự giới hạn trong trải nghiệm.
            </p>
          </section>

          <section className="about-section">
            <h3>Bước Ngoặt "Xe Siêu Lướt"</h3>
            <p>
              Chúng tôi quyết định dấn thân vào thế giới siêu xe lướt (Pre-owned) và phát hiện ra rằng: Một chiếc siêu xe được tuyển chọn kỹ lưỡng, bảo dưỡng đúng chuẩn vẫn giữ nguyên vẹn cái "chất" mãnh liệt, trong khi lại mang đến sự linh hoạt tối ưu về tài chính. Chơi xe lướt không chỉ là tiết kiệm, mà là sự lựa chọn thông minh để bạn trải nghiệm nhiều dòng xe danh tiếng hơn trong cùng một hành trình.
            </p>
          </section>

          <section className="about-section">
            <h3>Sứ Mệnh PitGo</h3>
            <p>
              PitGo ra đời để hiện thực hóa triết lý đó. Chúng tôi không chỉ là một trang web bán siêu xe, mà là một hệ sinh thái số thông minh:
            </p>
            <ul className="mission-list">
              <li><strong>Tuyển chọn khắt khe:</strong> Mỗi chiếc xe đều là một tuyệt tác cơ khí đã qua kiểm định chuyên sâu.</li>
              <li><strong>Trải nghiệm toàn diện:</strong> Giúp bạn kiểm soát mọi thông tin chỉ trong vài thao tác đơn giản.</li>
              <li><strong>Cộng đồng kết nối:</strong> Nơi hội ngộ của những người có chung dòng máu đam mê tốc độ.</li>
            </ul>
          </section>
        </div>

        {/* STATS */}
        <div className="about-stats">
          <div className="stat-box">
            <h3>1000+</h3>
            <p>Thành viên</p>
          </div>
          <div className="stat-box">
            <h3>500+</h3>
            <p>Xe cao cấp</p>
          </div>
          <div className="stat-box">
            <h3>50+</h3>
            <p>Đại lý đối tác</p>
          </div>
        </div>

        {/* VALUES */}
        <div className="about-values">
          <div className="value-item">
            <img src="/images/value1.jpg" alt="Công nghệ" />
            <h4>Công nghệ hiện đại</h4>
            <p>Nền tảng tối ưu, trải nghiệm mượt mà trên mọi thiết bị.</p>
          </div>
          <div className="value-item">
            <img src="/images/value2.jpg" alt="Kết nối" />
            <h4>Kết nối nhanh chóng</h4>
            <p>Liên kết trực tiếp người dùng với mạng lưới đại lý uy tín.</p>
          </div>
          <div className="value-item">
            <img src="/images/value3.jpg" alt="Đẳng cấp" />
            <h4>Đẳng cấp & Phong cách</h4>
            <p>Cá nhân hóa trải nghiệm sưu tầm xe sang theo cách riêng.</p>
          </div>
        </div>

        {/* TEAM */}
        <div className="about-team">
          <div className="team-title">
            <span>ĐỘI NGŨ CỦA CHÚNG TÔI</span>
          </div>

          <div className="teams-title-line"></div>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src="/images/member2.jpg" alt="Lâm Công Tiến" />
              </div>
              <h4>Lâm Công Tiến</h4>
              <p className="role">Leader</p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src="/images/member1.jpeg" alt="Phạm Đình Anh Khôi" />
              </div>
              <h4>Phạm Đình Anh Khôi</h4>
              <p className="role">Member</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}