import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import Error from "../components/Error";

function Settings({ showAlert }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // 1. Khai báo state để giữ dữ liệu từ MongoDB
  const [generalData, setGeneralData] = useState({
    site_title: "",
    hero_banners: [],
    shutdown: false,
  });

  const handleAddBanner = () => {
    const currentBanners = tempData.hero_banners || [];
    setTempData({ ...tempData, hero_banners: [...currentBanners, ""] });
  };

  const handleBannerChange = (index, value) => {
    const newBanners = [...tempData.hero_banners];
    newBanners[index] = value;
    setTempData({ ...tempData, hero_banners: newBanners });
  };

  const handleRemoveBanner = (index) => {
    const newBanners = tempData.hero_banners.filter((_, i) => i !== index);
    setTempData({ ...tempData, hero_banners: newBanners });
  };

  const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setImages(prev => [...prev, ...selectedFiles]);
            const filePreviews = selectedFiles.map((file) => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...filePreviews]);
        }
    };

  const handleRemoveImage = (indexToRemove) => {
        const itemToRemove = previews[indexToRemove];

        // Xóa khỏi mảng hiển thị (previews)
        const newPreviews = previews.filter((_, index) => index !== indexToRemove);
        setPreviews(newPreviews);

        // Nếu ảnh bị xóa là ảnh CHƯA LƯU (vừa mới up lên, có dạng blob:...)
        // thì ta phải xóa nó khỏi mảng file để không gửi lên server
        if (itemToRemove.startsWith("blob:")) {
            const oldImagesCount = previews.filter(p => !p.startsWith("blob:")).length;
            const imageIndex = indexToRemove - oldImagesCount;
            if (imageIndex >= 0) {
                const newImages = images.filter((_, idx) => idx !== imageIndex);
                setImages(newImages);
            }
        }
    };

  const [contactData, setContactData] = useState({
    address: "",
    gmap: "",
    pn1: "",
    pn2: "",
    email: "",
    fb: "",
    insta: "",
  });

  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({
    old_pass: "",
    new_pass: "",
    confirm_pass: "",
  });

  const [tempData, setTempData] = useState({});
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [tempContactData, setTempContactData] = useState({});

  // 2. Hàm gọi API từ Backend (Cổng 5000)
  const fetchSettings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/setting/");

      if (response.data.general_settings) {
        setGeneralData(response.data.general_settings);
        document.title =
          response.data.general_settings.site_title || "Project-SX - Admin";
      }

      if (response.data.contact_details) {
        setContactData(response.data.contact_details);
      }

      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleGeneralEditClick = () => {
        setTempData(generalData);
        setPreviews(generalData.hero_banners || []); // Hiện ảnh cũ
        setImages([]); // Đảm bảo mảng file mới rỗng
        setShowGeneralModal(true);
    };

  const handleContactEditClick = () => {
    setTempContactData(contactData);
    setShowContactModal(true);
  };

  const updateGeneralSettings = async () => {
        try {
            const formData = new FormData();
            formData.append("site_title", tempData.site_title || "");

            // Lọc ra các link ảnh cũ (bắt đầu bằng http) vẫn còn trên khung preview
            const retainedBanners = previews.filter(p => !p.startsWith("blob:"));
            formData.append("retained_banners", JSON.stringify(retainedBanners));

            // Đính kèm các file ảnh mới
            if (images && images.length > 0) {
                images.forEach((imgFile) => {
                    formData.append("images", imgFile);
                });
            }

            const response = await axios.post("http://localhost:5000/api/setting/update-general", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data) {
                setGeneralData(response.data.value);
                document.title = response.data.value.site_title || "Project-SX";
                
                setShowGeneralModal(false);
                setImages([]); 
                setPreviews([]); // Reset sạch sẽ
                
                showAlert("success", "Cập nhật Banner thành công!");
            }
        } catch (error) {
            showAlert("danger", "Lỗi lưu thay đổi!");
        }
    };

  const toggleShutdown = async (val) => {
    const updatedData = { ...generalData, shutdown: val };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/setting/update",
        {
          key: "general_settings",
          value: updatedData,
        },
      );

      if (response.data) {
        setGeneralData(updatedData);
        showAlert("success", `${val ? "Đóng" : "Mở"} website thành công!`);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái đóng cửa:", error);
      showAlert("danger", "Không thể thay đổi trạng thái website!");
    }
  };

  const updateContactDetails = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/setting/update",
        {
          key: "contact_details",
          value: tempContactData,
        },
      );

      if (response.data) {
        setContactData(tempContactData);
        setShowContactModal(false);
        showAlert("success", "Cập nhật thông tin liên hệ thành công!");
      }
    } catch (error) {
      showAlert(
        "danger",
        "Không thể cập nhật thông tin liên hệ. Vui lòng kiểm tra máy chủ!",
      );
    }
  };

  const handleUpdatePassword = async () => {
    if (!passData.old_pass || !passData.new_pass || !passData.confirm_pass) {
      showAlert("danger", "Vui lòng điền vào tất cả các trường!");
      return;
    }
    if (passData.new_pass !== passData.confirm_pass) {
      showAlert("danger", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/change-password",
        passData,
      );
      if (response.data.success) {
        showAlert("success", "Mật khẩu đã được cập nhật thành công!");
        setShowPassModal(false);
        setPassData({ old_pass: "", new_pass: "", confirm_pass: "" });
      } else {
        showAlert(
          "danger",
          response.data.message || "Không thể cập nhật mật khẩu.",
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      showAlert("danger", error.response?.data?.message || "Đã xảy ra lỗi.");
    }
  };

  if (error) return <Error message={error} />; // Nếu có lỗi trang, xoá component này
  if (loading) return <Loading message="LOADING..." />;

  return (
    <div style={{ padding: "15px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>Cài Đặt Chung</h2>
      </div>

      {/* General Settings Section */}
      <div className="settings-card">
        <div className="card-header">
          <h5 className="section-title">Thiết lập trang</h5>
          <button className="btn-edit" onClick={handleGeneralEditClick}>
            <i className="bi bi-pencil-square"></i> EDIT
          </button>
        </div>
        <div className="card-content">
          <h6 className="label">Tiêu đề</h6>
          <p className="data-text">
            {generalData.site_title || "Chưa có tiêu đề"}
          </p>

          {/* Xóa bỏ About Us và thay bằng số lượng Hero Banners */}
          <h6 className="label">Hero Banners</h6>
          <p className="data-text">
            {generalData.hero_banners?.length || 0} ảnh đang hiển thị
          </p>
        </div>
      </div>

      {/* Shutdown Website Section */}
      <div className="settings-card">
        <div className="card-header">
          <h5 className="section-title">Shutdown Website</h5>
          <div className="toggle-switch-wrapper">
            <span
              className={`status-text online ${generalData.shutdown === false ? "active" : ""}`}
            >
              Online
            </span>
            <label className="switch">
              <input
                type="checkbox"
                id="shutdown-switch"
                checked={generalData.shutdown}
                onChange={(e) => toggleShutdown(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span
              className={`status-text offline ${generalData.shutdown === true ? "active" : ""}`}
            >
              Offline
            </span>
          </div>
        </div>
        <div className="card-content">
          <p className="text-muted">
            Khi bật chế độ shutdown, khách hàng sẽ không thể truy cập website.
          </p>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="settings-card">
        <div className="card-header">
          <h5 className="section-title">Cài Đặt Liên Hệ</h5>
          <button className="btn-edit" onClick={handleContactEditClick}>
            <i className="bi bi-pencil-square"></i> EDIT
          </button>
        </div>
        <div className="card-content grid-2-col">
          <div className="contact-col" style={{overflow: "hidden"}}>
            <h6 className="label">Địa chỉ</h6>
            <p className="data-text">{contactData.address || "Not set"}</p>
            <h6 className="label">Google Maps Link</h6>
            <p className="data-text truncate">
              {contactData.gmap || "Not set"}
            </p>
            <h6 className="label">Số Điện Thoại</h6>
            <p className="data-text">
              <i className="bi bi-telephone-fill"></i>{" "}
              {contactData.pn1 || "N/A"}
            </p>
            <p className="data-text">
              <i className="bi bi-telephone-fill"></i>{" "}
              {contactData.pn2 || "N/A"}
            </p>
          </div>
          <div className="contact-col">
            <h6 className="label">Email</h6>
            <p className="data-text">{contactData.email || "Not set"}</p>
            <h6 className="label">Social Links</h6>
            <p className="data-text">Facebook: {contactData.fb || "N/A"}</p>
            <p className="data-text">Instagram: {contactData.insta || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Security Settings Card */}
      <div className="settings-card">
        <div className="card-header">
          <h5 className="section-title">Bảo mật</h5>
          <button className="btn-edit" onClick={() => setShowPassModal(true)}>
            <i className="bi bi-shield-lock"></i> Đổi mật khẩu
          </button>
        </div>
        <div className="card-content">
          <p className="text-muted">
            Để bảo mật tài khoản admin, bạn nên thay đổi mật khẩu định kỳ và không chia sẻ thông tin đăng nhập với người khác.
          </p>
        </div>
      </div>

      {/* General Modal */}
      {showGeneralModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-dialog">
            <div className="modal-header">
              <h5>Chỉnh sửa Thiết lập Trang</h5>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề Trang</label>
                <input
                  type="text"
                  value={tempData.site_title || ""}
                  onChange={(e) =>
                    setTempData({ ...tempData, site_title: e.target.value })
                  }
                />
              </div>

              {/* Khu vực nhập nhiều link ảnh Slider */}
              <div className="form-group">
                <label>Hero Banners</label>

                {/* QUAN TRỌNG: Thêm thuộc tính multiple vào đây */}
                <input
                  type="file"
                  className="file-input"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {/* Khung Preview cho nhiều ảnh */}
                <div
                  className="image-preview-container"
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "15px",
                    minHeight: "100px",
                  }}
                >
                  {previews.length > 0 ? (
                    previews.map((previewSrc, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <img
                          src={previewSrc}
                          alt={`Preview ${index + 1}`}
                          className="img-fill"
                          style={{
                            width: "140px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />

                        {/* NÚT (X) MÀU ĐỎ GÓC TRÊN BÊN PHẢI */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            backgroundColor: "#ef4444", // Màu đỏ
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                          title="Xóa ảnh này"
                        >
                          X
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className="no-image-placeholder"
                      style={{ width: "100%", textAlign: "center" }}
                    >
                      <span>Chưa có hình ảnh nào được chọn</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowGeneralModal(false);
                  setImages([]);
                  setPreviews([]);
                }}
              >
                Hủy
              </button>
              <button className="btn-save" onClick={updateGeneralSettings}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-dialog modal-lg">
            <div className="modal-header">
              <h5>Chỉnh sửa Cài đặt Liên hệ</h5>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={tempContactData.address}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Google Maps Link</label>
                  <input
                    type="text"
                    value={tempContactData.gmap}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        gmap: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>SĐT 1</label>
                  <input
                    type="number"
                    value={tempContactData.pn1}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        pn1: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>SĐT 2</label>
                  <input
                    type="number"
                    value={tempContactData.pn2}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        pn2: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Instagram Link</label>
                  <input
                    type="text"
                    value={tempContactData.insta}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        insta: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Facebook Link</label>
                  <input
                    type="text"
                    value={tempContactData.fb}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        fb: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={tempContactData.email}
                    onChange={(e) =>
                      setTempContactData({
                        ...tempContactData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowContactModal(false)}
              >
                Hủy
              </button>
              <button className="btn-save" onClick={updateContactDetails}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPassModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-dialog">
            <div className="modal-header">
              <h5>Thay đổi Mật khẩu Admin</h5>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passData.old_pass}
                  onChange={(e) =>
                    setPassData({ ...passData, old_pass: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={passData.new_pass}
                  onChange={(e) =>
                    setPassData({ ...passData, new_pass: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Xác nhận Mật khẩu Mới</label>
                <input
                  type="password"
                  value={passData.confirm_pass}
                  onChange={(e) =>
                    setPassData({ ...passData, confirm_pass: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPassModal(false)}
              >
                Hủy
              </button>
              <button className="btn-save" onClick={handleUpdatePassword}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
