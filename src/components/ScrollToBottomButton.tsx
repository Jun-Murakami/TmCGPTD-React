import Fab from '@mui/material/Fab';
import SwipeDownAltRoundedIcon from '@mui/icons-material/SwipeDownAltRounded';

export function ScrollToBottomButton() {
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth', // スムーズスクロールを指定
    });
  };

  return (
    <SwipeDownAltRoundedIcon
      aria-label='scroll down'
      onClick={scrollToBottom}
      sx={{ color: 'grey.500', position: 'fixed', right: '4px', bottom: '28px', zIndex: 99999 }}
    />
  );
}
