import ExpandCircleDownRoundedIcon from '@mui/icons-material/ExpandCircleDownRounded';

export function ScrollToBottomButton() {
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth', // スムーズスクロールを指定
    });
  };

  return (
    <ExpandCircleDownRoundedIcon
      aria-label='scroll down'
      onClick={scrollToBottom}
      sx={{ color: 'grey.500', position: 'fixed', right: '8px', bottom: '28px', zIndex: 1000 }}
    />
  );
}
