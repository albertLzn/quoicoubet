import { useSpring } from 'react-spring';

export const usePageTransition = () => {
  return useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });
};

export const useCardFlip = (isFlipped: boolean) => {
  return useSpring({
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    config: { mass: 5, tension: 500, friction: 80 },
  });
};

export const useButtonHover = () => {
  return useSpring({
    from: { scale: 1 },
    to: { scale: 1.05 },
    config: { tension: 300, friction: 10 },
  });
};