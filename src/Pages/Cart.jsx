import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "../features/cart/cartSlice";
import { checkCoupon } from "../utils/coupons";

const FREE_SHIPPING_FROM = 100;
const SHIPPING_FEE = 8;

function Cart() {
  const cart = useSelector((state) => state.cart);
  const quizDone = useSelector((state) => Boolean(state.quiz.answers));
  const isMember = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, rate, message }
  const [couponMsg, setCouponMsg] = useState({ text: "", ok: false });
  const [ordered, setOrdered] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? subtotal * coupon.rate : 0;
  const afterDiscount = subtotal - discount;
  const shipping = cart.length === 0 || afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  function applyCoupon(e) {
    e.preventDefault();
    const result = checkCoupon(code, { isMember, quizDone });
    if (result.ok) {
      setCoupon(result);
      setCouponMsg({ text: result.message, ok: true });
    } else {
      setCoupon(null);
      setCouponMsg({ text: result.message, ok: false });
    }
  }

  function handleCheckout() {
    // Demo only. With the backend this will create an order in MongoDB.
    dispatch(clearCart());
    setCoupon(null);
    setOrdered(true);
  }

  if (ordered) {
    return (
      <section className="page">
        <div className="empty">
          <h2>Order placed</h2>
          <p>Thank you. This is a demo order, real checkout comes with the backend.</p>
          <Link to="/products" className="btn" style={{ marginTop: 20 }}>
            Keep shopping
          </Link>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="page">
        <div className="empty">
          <h2>Your bag is empty</h2>
          <p>Find something you love and it will show up here.</p>
          <Link to="/products" className="btn" style={{ marginTop: 20 }}>
            Shop the collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <h1>My bag</h1>
      </div>

      <div className="cart-layout">
        <div>
          {cart.map((item) => (
            <div className="cart-item" key={item.cartId}>
              <img src={item.thumbnail} alt={item.title} />

              <div>
                <h3>{item.title}</h3>
                <div className="meta">
                  ${item.price}
                  {item.size && <> · Size {item.size}</>}
                </div>

                <div className="qty">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => dispatch(decreaseQuantity(item.cartId))}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => dispatch(increaseQuantity(item.cartId))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
                <button
                  className="link-btn"
                  onClick={() => dispatch(removeFromCart(item.cartId))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h2>Summary</h2>

          <form className="coupon-row" onSubmit={applyCoupon}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              aria-label="Coupon code"
            />
            <button className="btn ghost" type="submit">Apply</button>
          </form>
          <p className={`coupon-msg ${couponMsg.ok ? "ok" : ""}`}>
            {couponMsg.text ||
              (quizDone
                ? "You unlocked STYLE25 for 25% off."
                : "Members: try MENNOVA20. Finish the style quiz to unlock more.")}
          </p>

          <div className="line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {coupon && (
            <div className="line disc">
              <span>Discount ({Math.round(coupon.rate * 100)}%)</span>
              <span>−${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="line">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="line total"><span>Total</span><span>${total.toFixed(2)}</span></div>

          <button className="btn full" style={{ marginTop: 18 }} onClick={handleCheckout}>
            Checkout
          </button>
          <p className="coupon-msg" style={{ marginTop: 10 }}>
            Free shipping on orders over ${FREE_SHIPPING_FROM}.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default Cart;