import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentMethod.css";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip } = location.state || {};

  const fare = Number(trip?.fare || trip?.price || 60);

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [walletBalance, setWalletBalance] = useState(0);

  // Form states
  const [upiId, setUpiId] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  // Fetch logged in user details from local storage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = storedUser.id || storedUser._id;

  // Fetch updated wallet balance from MongoDB on load
  const fetchWalletBalance = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/wallet/${userId}`);
      const data = await res.json();
      if (data?.walletBalance !== undefined) {
        setWalletBalance(data.walletBalance);

        // Keep local storage in sync
        const updatedUser = { ...storedUser, walletBalance: data.walletBalance };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID.");
      return;
    }
    setIsUpiVerified(true);
  };

  const handlePayment = async () => {
    if (selectedMethod === "upi") {
      if (!upiId.trim()) {
        alert("Please enter a UPI ID.");
        return;
      }
      if (!isUpiVerified) {
        alert("Please verify your UPI ID before proceeding.");
        return;
      }
    }

    if (selectedMethod === "card") {
      const { cardNumber, expiry, cvv, name } = cardDetails;
      if (!cardNumber || !expiry || !cvv || !name) {
        alert("Please complete all card details.");
        return;
      }
    }

    // Process Deduction for In-App Wallet
    if (selectedMethod === "wallet") {
      if (!userId) {
        alert("User session not found. Please log in again.");
        return;
      }

      if (walletBalance < fare) {
        alert(
          `Insufficient wallet balance! Available: ₹${walletBalance}, Required: ₹${fare}.`
        );
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/wallet/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, amount: fare }),
        });

        const data = await res.json();

        if (res.ok && data?.walletBalance !== undefined) {
          // Update local state
          setWalletBalance(data.walletBalance);

          // Update local storage so wallet section displays subtracted balance across the app
          const updatedUser = { ...storedUser, walletBalance: data.walletBalance };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          alert(data.message || "Failed to deduct funds from wallet.");
          return;
        }
      } catch (err) {
        console.error("Backend wallet deduction failed:", err);
        alert("Server error processing wallet payment.");
        return;
      }
    }

    // Process Trip Payment Status Update
    try {
      const tripId = trip?._id || trip?.id;
      if (tripId) {
        await fetch(`http://localhost:5000/api/rides/pay-trip/${tripId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPaid: true, paymentMethod: selectedMethod }),
        });
      }
      alert(`Payment of ₹${fare} successful via ${selectedMethod.toUpperCase()}!`);
      navigate("/my-trips");
    } catch (error) {
      console.warn("Backend payment status update failed, proceeding locally:", error);
      alert(`Payment of ₹${fare} processed successfully!`);
      navigate("/my-trips");
    }
  };

  return (
    <div className="payment-page">
      {/* Sidebar */}
      <aside className="payment-sidebar">
        <h2 className="sidebar-heading">My Trips</h2>
      </aside>

      {/* Main Payment Container */}
      <main className="payment-main-content">
        <div className="payment-header">
          <span className="back-link" onClick={() => navigate(-1)}>
            &lt; Payment Method
          </span>
        </div>

        <div className="payment-card">
          <div className="payment-options-grid">
            {/* Top Row: Cash & Card Selection */}
            <div className="payment-row">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={selectedMethod === "cash"}
                  onChange={() => setSelectedMethod("cash")}
                />
                <span className="option-label">Cash Payment</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedMethod === "card"}
                  onChange={() => setSelectedMethod("card")}
                />
                <span className="option-label">Card Payment</span>
              </label>
            </div>

            {/* DYNAMIC CARD PAYMENT FORM */}
            {selectedMethod === "card" && (
              <div className="card-form-container">
                <div className="input-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                  />
                </div>
                <div className="input-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    maxLength="19"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                  />
                </div>
                <div className="card-row-split">
                  <div className="input-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                    />
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="•••"
                      maxLength="4"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Middle Row: UPI Payment Options */}
            <div className="payment-row upi-row">
              <div className="upi-left">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={selectedMethod === "upi"}
                    onChange={() => setSelectedMethod("upi")}
                  />
                  <span className="option-label">UPI Payment</span>
                </label>

                {selectedMethod === "upi" && (
                  <div className="upi-input-wrapper">
                    <input
                      type="text"
                      className="upi-input"
                      placeholder="Enter UPI ID"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setIsUpiVerified(false);
                      }}
                    />
                    <span className="upi-domain">@ABCD</span>
                    <button
                      type="button"
                      className={`verify-btn ${isUpiVerified ? "verified" : ""}`}
                      onClick={handleVerifyUpi}
                    >
                      {isUpiVerified ? "✓ Verified" : "Verify"}
                    </button>
                  </div>
                )}
              </div>

              {selectedMethod === "upi" && (
                <div className="upi-right">
                  <label className="scan-label">
                    <span className="radio-dot"></span>
                    Scan
                  </label>
                  <div className="qr-box">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=merchant@abcd&am=${fare}`}
                      alt="UPI QR Code"
                      className="qr-code-img"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: In-App Wallet Payment */}
            <div className="payment-row wallet-row">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={selectedMethod === "wallet"}
                  onChange={() => setSelectedMethod("wallet")}
                />
                <span className="option-label">In-App Wallet</span>
              </label>

              {selectedMethod === "wallet" && (
                <div className="wallet-balance-info">
                  Available Balance: <strong>₹{walletBalance}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pay-button-container">
            <button
              type="button"
              className="pay-submit-btn"
              onClick={handlePayment}
            >
              PaY ₹ {fare}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentMethod;