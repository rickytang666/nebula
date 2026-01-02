import React from 'react';
import {
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AIToolsSection from './AIToolsSection';

interface AIToolsModalProps {
  visible: boolean;
  onClose: () => void;
  noteContent: string;
  noteTitle: string;
}

const AIToolsModal: React.FC<AIToolsModalProps> = ({
  visible,
  onClose,
  noteContent,
  noteTitle,
}) => {
  // const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="AI Tools Modal"
    >
      <SafeAreaView className="flex-1 bg-base-100" edges={['top', 'left', 'right', 'bottom']}>
        <AIToolsSection
          onClose={onClose}
          noteContent={noteContent}
          noteTitle={noteTitle}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default AIToolsModal;
