import React from 'react';
import './Pricing.css';

const plans = [
  {
    name: 'Monthly',
    price: '₹522',
    description: 'For small projects and one off needs',
    features: ['Word Import', 'Xmind Import', 'Freemind Import'],
    button: 'Upgrade now',
    badge: null,
    subtext: null,
  },
  {
    name: 'Yearly',
    price: '₹86.91 /month',
    description: 'Unlimited use for your creative needs',
    subtext: '₹1,043 for one year',
    features: ['Word Import', 'Xmind Import', 'Freemind Import'],
    button: 'Upgrade now',
    badge: 'Popular',
  },
  {
    name: 'Lifetime',
    price: '₹3,651',
    description: 'Unlimited AI generation and design',
    subtext: 'One-time payment for lifetime access',
    features: ['Build from 800+ templates', 'Word Import', 'Xmind Import'],
    button: 'Upgrade now',
    badge: 'Limited-time offer',
  },
];

const Pricing = () => {
  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Plans&amp;pricing</h1>
      <div className="currency-switch">💰 INR ⏷</div>

      <div className="pricing-cards">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.badge === 'Popular' ? 'highlight' : ''}`}>
            <div className="card-header">
              <h2>{plan.name}</h2>
              {plan.discount && <span className="discount-tag">{plan.discount}</span>}
              {plan.badge && <span className="badge-tag">{plan.badge}</span>}
            </div>
            <p className="plan-desc">{plan.description}</p>
            <h3 className="plan-price">{plan.price}</h3>
            {plan.subtext && <p className="subtext">{plan.subtext}</p>}
            <button className="upgrade-btn">{plan.button}</button>
            <ul className="features-list">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
