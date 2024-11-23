import React from 'react';
import { Card, CardProps } from '@mui/material';
import { animated, useSpring } from 'react-spring';

const AnimatedCard: React.FC<CardProps> = (props) => {
  const [spring, set] = useSpring(() => ({
    transform: 'scale(1) translateY(0px)',
    shadow: '0px 2px 4px rgba(0,0,0,0.2)',
  }));

  return (
    <animated.div
      style={{
        transform: spring.transform,
        boxShadow: spring.shadow,
      }}
      onMouseEnter={() => 
        set({ 
          transform: 'scale(1.02) translateY(-4px)',
          shadow: '0px 8px 16px rgba(0,0,0,0.2)',
        })
      }
      onMouseLeave={() => 
        set({ 
          transform: 'scale(1) translateY(0px)',
          shadow: '0px 2px 4px rgba(0,0,0,0.2)',
        })
      }
    >
      <Card {...props} />
    </animated.div>
  );
};

export default AnimatedCard;