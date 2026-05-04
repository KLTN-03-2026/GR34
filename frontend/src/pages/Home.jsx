import { useNavigate } from "react-router-dom";

import HeroBanner from "../components/homepage/HeroBanner";

import RealtimeSection from "../components/homepage/RealtimeSection";
import Testimonials from "../components/homepage/Testimonials";
import FinalCTA from "../components/homepage/FinalCTA";

import ChatBubble from "../components/ChatBubble";
import ChatPopupTop from "../components/ChatPopupTop";
import FloatingActions from "../components/FloatingActions";

import { useChat } from "../hooks/useChat";

import AboutSection from "../components/homepage/AboutSection";
import PartnerCarousel from "../components/homepage/PartnerCarousel";
import CommitmentSection from "../components/homepage/CommitmentSection";
import ServicesSection from "../components/homepage/ServicesSection";
import PricingAboutSection from "../components/homepage/PricingAboutSection";
import OrderProcessSection from "../components/homepage/OrderProcessSection";
import NewsSection from "../components/homepage/News";

// Trang chủ SpeedyShip
export default function Home() {
  const navigate = useNavigate();

  const {
    aiOpen,
    supportOpen,
    openAIChat,
    openSupportChat,
    closeAIChat,
    closeSupportChat,
  } = useChat();

  return (
    <>
      {}
      {}
      <HeroBanner />

      <AboutSection />

      <PartnerCarousel
        className="py-10 bg-white"
        logoSize="w-32 h-16 md:w-40 md:h-20"
      />

      <ServicesSection />

      <OrderProcessSection />

      <PricingAboutSection />

      <CommitmentSection />

      {}
      {}
      {}
      {}

      {}
      <RealtimeSection onChatAI={openAIChat} />

      <Testimonials />

      {}

      <FinalCTA onChat={openSupportChat} />

      <NewsSection />

      {}

      {aiOpen && <ChatPopupTop onClose={closeAIChat} bubbleOpen={false} />}

      {supportOpen && <ChatBubble onClose={closeSupportChat} />}

      {}
      <FloatingActions
        onOpenChatBubble={openSupportChat}
        onOpenChatTop={openAIChat}
      />
    </>
  );
}
