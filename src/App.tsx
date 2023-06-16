import { useDialogStore } from './store/dialogStore';
import { ModalDialog } from './components/ModalDialog';
import { MainContainer } from './components/MainContainer';


function App() {
  const isDialogVisible = useDialogStore((state) => state.isDialogVisible);

  return (
    <>
      {isDialogVisible && ( <ModalDialog /> )}
      <MainContainer />
    </>
  );
}

export default App;
