import {
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  useIonToast,
} from "@ionic/react";
import { CommentView } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { Centered, Spinner } from "../../auth/Login";
import { jwtSelector } from "../../auth/authSlice";
import { editComment } from "../commentSlice";
import { Container, Textarea } from "../reply/CommentReply";
import { DismissableProps } from "../../shared/DynamicDismissableModal";

type CommentEditingProps = DismissableProps & {
  item: CommentView;
};

export default function CommentEdit({
  item,
  setCanDismiss,
  dismiss,
}: CommentEditingProps) {
  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState(item.comment.content);
  const jwt = useAppSelector(jwtSelector);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCanDismiss(item.comment.content === replyContent);
  }, [replyContent, item, setCanDismiss]);

  async function submit() {
    if (!jwt) return;

    setLoading(true);

    try {
      await dispatch(editComment(item.comment.id, replyContent));
    } catch (error) {
      present({
        message: "Problem saving your changes. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    present({
      message: "Comment edited!",
      duration: 3500,
      position: "bottom",
      color: "success",
    });

    setCanDismiss(true);
    setTimeout(() => dismiss(), 100);
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>
            <Centered>
              Edit Comment
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong={true}
              type="submit"
              disabled={
                !replyContent.trim() ||
                item.comment.content === replyContent ||
                loading
              }
              onClick={submit}
            >
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container>
          <Textarea
            onChange={(e) => setReplyContent(e.target.value)}
            value={replyContent}
            autoFocus
          />
        </Container>
      </IonContent>
    </>
  );
}
