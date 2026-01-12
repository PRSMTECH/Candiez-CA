import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Candy,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  CheckCircle
} from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './WelcomeTutorial.module.css';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Candiez!',
    icon: Candy,
    content: 'Your dispensary management system is ready to go. Let\'s take a quick tour to help you get started.',
    tip: 'This tutorial will take about 2 minutes.',
    color: '#9333ea'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    content: 'Your dashboard shows daily sales, customer count, inventory alerts, and recent transactions at a glance.',
    tip: 'Check your dashboard first thing each day to stay on top of your business.',
    route: '/dashboard',
    color: '#3b82f6'
  },
  {
    id: 'pos',
    title: 'Point of Sale',
    icon: ShoppingCart,
    content: 'The POS is where you\'ll spend most of your time. Browse products, build a cart, select customers, and process payments.',
    tip: 'Always ask customers if they\'re loyalty members before checkout!',
    route: '/pos',
    features: [
      'Start a shift with your drawer count',
      'Add products to cart',
      'Link customers for loyalty points',
      'Process cash or debit payments'
    ],
    color: '#10b981'
  },
  {
    id: 'customers',
    title: 'Customer Management',
    icon: Users,
    content: 'Track your customers, view their purchase history, and manage their loyalty points.',
    tip: 'Registered customers earn loyalty points on every purchase.',
    route: '/customers',
    features: [
      'Search customers by name, phone, or email',
      'View transaction history',
      'Track loyalty tier progress',
      'Add notes for special preferences'
    ],
    color: '#f59e0b'
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program',
    icon: Star,
    content: 'Reward your repeat customers with our tiered loyalty program.',
    tip: 'Higher tiers earn bonus points on every purchase!',
    features: [
      { tier: 'Bronze', points: '0 pts', multiplier: '1x' },
      { tier: 'Silver', points: '500 pts', multiplier: '1.25x' },
      { tier: 'Gold', points: '1,500 pts', multiplier: '1.5x' },
      { tier: 'Platinum', points: '5,000 pts', multiplier: '2x' }
    ],
    isLoyalty: true,
    color: '#eab308'
  },
  {
    id: 'products',
    title: 'Product Catalog',
    icon: Package,
    content: 'Manage your entire product inventory with detailed information including THC/CBD percentages and strain types.',
    tip: 'Keep product descriptions detailed to help budtenders make recommendations.',
    route: '/products',
    requiresRole: ['admin', 'manager'],
    color: '#8b5cf6'
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Warehouse,
    content: 'Track stock levels, make adjustments, and get alerts when products run low.',
    tip: 'Always select a reason when adjusting stock for accurate audit trails.',
    route: '/inventory',
    requiresRole: ['admin', 'manager'],
    features: [
      'Real-time stock tracking',
      'Low stock alerts',
      'Adjustment history',
      'Restock tracking'
    ],
    color: '#ec4899'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    icon: CheckCircle,
    content: 'You now know the basics of Candiez. Explore the system, and remember - you can always access help from the settings menu.',
    tip: 'For detailed instructions, check out the full documentation in the docs folder.',
    color: '#22c55e'
  }
];

function WelcomeTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeTutorial, showTutorial } = useTutorial();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Only show tutorial for authenticated users
  if (!showTutorial || !isAuthenticated) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Filter steps based on user role
  const canViewStep = () => {
    if (!step.requiresRole) return true;
    return step.requiresRole.includes(user?.role);
  };

  const handleNext = () => {
    let nextStep = currentStep + 1;

    // Skip steps user doesn't have access to
    while (nextStep < tutorialSteps.length && tutorialSteps[nextStep].requiresRole) {
      if (!tutorialSteps[nextStep].requiresRole.includes(user?.role)) {
        nextStep++;
      } else {
        break;
      }
    }

    if (nextStep < tutorialSteps.length) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    let prevStep = currentStep - 1;

    // Skip steps user doesn't have access to
    while (prevStep >= 0 && tutorialSteps[prevStep].requiresRole) {
      if (!tutorialSteps[prevStep].requiresRole.includes(user?.role)) {
        prevStep--;
      } else {
        break;
      }
    }

    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const handleComplete = () => {
    completeTutorial();
    navigate('/dashboard');
  };

  const handleGoTo = (route) => {
    completeTutorial();
    navigate(route);
  };

  // Count visible steps for progress
  const visibleSteps = tutorialSteps.filter(s => {
    if (!s.requiresRole) return true;
    return s.requiresRole.includes(user?.role);
  });
  const visibleCurrentIndex = visibleSteps.findIndex(s => s.id === step.id);
  const progress = ((visibleCurrentIndex + 1) / visibleSteps.length) * 100;

  if (!canViewStep()) {
    handleNext();
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%`, backgroundColor: step.color }}
          />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            Step {visibleCurrentIndex + 1} of {visibleSteps.length}
          </div>
          <button
            className={styles.skipButton}
            onClick={handleSkip}
            aria-label="Skip tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div
            className={styles.iconWrapper}
            style={{ backgroundColor: `${step.color}15`, borderColor: step.color }}
          >
            <Icon size={48} style={{ color: step.color }} />
          </div>

          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.description}>{step.content}</p>

          {/* Features list */}
          {step.features && !step.isLoyalty && (
            <ul className={styles.featureList}>
              {step.features.map((feature, idx) => (
                <li key={idx} className={styles.featureItem}>
                  <CheckCircle size={16} style={{ color: step.color }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Loyalty tiers */}
          {step.isLoyalty && step.features && (
            <div className={styles.loyaltyGrid}>
              {step.features.map((tier, idx) => (
                <div key={idx} className={styles.loyaltyTier}>
                  <Star
                    size={20}
                    fill={idx === 3 ? '#eab308' : 'none'}
                    style={{ color: '#eab308' }}
                  />
                  <span className={styles.tierName}>{tier.tier}</span>
                  <span className={styles.tierPoints}>{tier.points}</span>
                  <span className={styles.tierMultiplier}>{tier.multiplier}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tip box */}
          {step.tip && (
            <div className={styles.tipBox} style={{ borderColor: step.color }}>
              <strong>Tip:</strong> {step.tip}
            </div>
          )}

          {/* Go to page button */}
          {step.route && !isLastStep && (
            <button
              className={styles.goToButton}
              onClick={() => handleGoTo(step.route)}
              style={{ backgroundColor: step.color }}
            >
              Go to {step.title}
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Footer navigation */}
        <div className={styles.footer}>
          <button
            className={styles.navButton}
            onClick={handlePrev}
            disabled={isFirstStep}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {isLastStep ? (
            <button
              className={styles.completeButton}
              onClick={handleComplete}
            >
              Get Started
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className={styles.nextButton}
              onClick={handleNext}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeTutorial;
