import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.8 }}
         >
        <p className="hero-label">NEW COLLECTION — 2026</p>

        <h1>
          Style that
          <br />
          speaks <span>you.</span>
        </h1>

        <p className="hero-description">
          Discover timeless pieces designed to make
          every moment feel extraordinary.
        </p>

        <button className="hero-button">
          Shop Now →
        </button>
      </div>

      <div
        className="hero-image"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        >
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          alt="Fashion collection"
        />
      </div>
    </section>
  )
}

export default Hero
