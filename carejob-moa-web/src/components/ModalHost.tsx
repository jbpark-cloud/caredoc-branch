"use client";
import { useAuth } from "./providers";
import LoginModal from "./modals/LoginModal";
import BizJoinModal from "./modals/BizJoinModal";
import ApplyModal from "./modals/ApplyModal";
import { OrderModal, TalentModal } from "./modals/BizModals";

export default function ModalHost() {
  const { modal } = useAuth();
  if (!modal) return null;
  switch (modal.type) {
    case "login": return <LoginModal key="login" kind={modal.kind} then={modal.then} />;
    case "bizjoin": return <BizJoinModal key="bizjoin" then={modal.then} step={modal.step} />;
    case "apply": return <ApplyModal key={"apply" + modal.job.id} job={modal.job} />;
    case "order": return <OrderModal key="order" name={modal.name} price={modal.price} />;
    case "talent": return <TalentModal key={"t" + modal.talent.id} talent={modal.talent} />;
  }
}
