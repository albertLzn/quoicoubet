import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { animated, useSpring } from 'react-spring';

const AnimatedButton: React.FC<ButtonProps> = (props) => {
  const [spring, set] = useSpring(() => ({
    scale: 1,
    shadow: '0px 2px 4px rgba(0,0,0,0.2)',
  }));

  return (
    <animated.div
      style={{
        transform: spring.scale.to(s => `scale(${s})`),
        boxShadow: spring.shadow,
      }}
      onMouseEnter={() => set({ scale: 1.05, shadow: '0px 4px 8px rgba(0,0,0,0.3)' })}
      onMouseLeave={() => set({ scale: 1, shadow: '0px 2px 4px rgba(0,0,0,0.2)' })}
    >
      <Button {...props} />
    </animated.div>
  );
};

export default AnimatedButton;