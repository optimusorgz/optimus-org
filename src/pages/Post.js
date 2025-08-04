import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import InfiniteTypingText from '../components/InfiniteTypingText';
import { PageWrapper } from '../components/common/PageWrapper';
import { pulseGradient } from '../styles/GlobalStyles'; // Import pulseGradient

// Mock Data for Posts Only
const mockPosts = [
  {
    id: 'p3',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '1 day ago',
    type: 'video',
    media: require('../assets/post/post1.mp4'),
    caption: 'Day18/365 Interacting with some freshers (Life, documentary, cinematics, cinematography, vlog, daily,)'
  },
  {
    id: 'p5',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '3 days ago',
    type: 'video',
    media: require('../assets/post/post2.mp4'),
    caption: 'Don’t just attend the Induction make it memorable! Drop by our stalls at the Unipolis induction area and say hey! ☺️✨',
  },
  {
    id: 'p7',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '5 days ago',
    type: 'video',
    media: require('../assets/post/post3.mp4'),
    caption: 'A new journey begins full of learning, fun, and endless memories. We’re excited to have you with us. Let’s make it unforgettable! 💫',
  },
  {
    id: 'p9',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '1 week ago',
    type: 'video',
    media: require('../assets/post/post4.mp4'),
    caption: 'Kijiye meeting meeting Kheliye meeting meeting 🤝🤝',
  },
  {
    id: 'p11',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '2 weeks ago',
    type: 'video',
    media: require('../assets/post/post5.mp4'),
    caption: '🎮 OPTIMUS ARENA: The Gaming Showdown – A Battle of Strategy, Skill & Supremacy! 🔥🏆',
  },
  {
    id: 'p13',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '3 weeks ago',
    type: 'video',
    media: require('../assets/post/post6.mp4'),
    caption: 'Optimus Arena is over, but the memories are here to stay! Reliving some epic moments from the event 🔥',
  },
  {
    id: 'p15',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '1 month ago',
    type: 'video',
    media: require('../assets/post/post7.mp4'),
    caption: 'Time is ticking! Only 2 days left for Optimus Arena—your chance to prove your skills and dominate the competition! Are you ready to rise above the rest? Don’t miss out! ⚡🔥',
  },
  {
    id: 'p17',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '2 months ago',
    type: 'video',
    media: require('../assets/post/post8.mp4'),
    caption: '🚨 Only 3 days left! Time is running out—secure your spot at Optimus Arena now! 🔥 Don’t miss out on the ultimate challenge! ',
  },
  {
    id: 'p18',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '3 months ago',
    type: 'video',
    media: require('../assets/post/post9.mp4'),
    caption: 'Gear up, gamers! The ultimate showdown is here—Optimus Arena is just days away! ⚡ Register now before it’s too late and claim your spot in the gaming battle of the year. 🏆 Don’t miss out—let the games begin! 🕹️',
  },
  {
    id: 'p19',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '4 months ago',
    type: 'video',
    media: require('../assets/post/post10.mp4'),
    caption: '💥 Get ready for Optimus Arena, where gamers unite for epic battles and endless fun. Whether you’re a pro or just playing for the love of the game, this is your time to shine! See you on Feb 26-28! 🎮🔥',
  },
  {
    id: 'p20',
    username: 'optimus.orgz',
    avatar: require('../assets/optimuslogo.jpg'),
    timestamp: '5 months ago',
    type: 'video',
    media: require('../assets/post/post11.mp4'),
    caption: '🚀 Join Optimus and be part of something bigger! 💡✨ Unleash your potential, innovate, and create with the best minds. Recruitment starts now—are you ready? 🔥',
  },
];

const GradientBackground = styled.div`
  min-height: 100vh;
  padding-top: 70px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: radial-gradient(
    circle at top left,
    rgba(255, 255, 255, 0.3) 7%,
    rgba(255, 255, 255, 0.1) 12%,
    rgba(12, 12, 29, 0.8) 20%,
    rgba(12, 12, 29, 1) 40%,
    transparent 90%
  );
  background-color: rgba(12,12,29,255);
  background-position: left top;
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite;
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  @media (max-width: 900px) {
    min-height: 100vh;
  }
  @media (max-width: 768px) {
    padding: 60px 0;
  }

  &:hover {
    opacity: 1;
  }

  &.active {
    opacity: 1;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  }
`;

const SectionToggleContainer = styled.div`
  gap: 10px;
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const SectionToggleButton = styled.button`
  border: none;
  font-size: 2em;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  background: none;

  &:hover {
    opacity: 1;
  }

  &.active {
    opacity: 1;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  }
`;

// VideoWithSound component for hover sound and mobile autoplay
const VideoWithSound = ({ src }) => {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMobile) {
      video.muted = false; // Play with sound on mobile
      const observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              video.muted = false;
              video.play().catch(() => { });
            } else {
              video.pause();
              video.currentTime = 0;
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(video);
      return () => observer.disconnect();
    } else {
      // Desktop: always pause and reset when rendered
      video.pause();
      video.currentTime = 0;
      video.muted = true; // Always muted on desktop
    }
  }, [isMobile, src]);

  // Desktop: play with sound on hover
  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.muted = true; // Always muted on desktop
      videoRef.current.play().catch(() => {
        videoRef.current.muted = true;
        videoRef.current.play();
      });
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
    }
  };

  // Mobile: tap to unmute and play with sound
  const handleMobileTap = () => {
    // No tap needed for mobile, autoplay with sound
  };

  return (
    <video
      ref={videoRef}
      src={src}
      playsInline
      controls={false}
      muted={!isMobile}
      style={{ pointerEvents: 'auto', width: '100%', height: '100%', objectFit: 'cover', background: '#eee', display: 'block', position: 'static' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

const ContentContainer = styled.div`
  width: 100%;
  max-width: 900px;
  /* Re-added background color */
  border-radius: 15px;

  @media (max-width: 900px) {
    max-width: 100%;
  }
  
`;

const PostCard = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(40, 20, 60, 0.5);
  overflow: hidden;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(24, 18, 38, 0.98) 60%, rgba(40, 20, 60, 0.95) 100%);
  box-shadow: 0 4px 24px rgba(20, 10, 40, 0.18);
  width: 100%;
  max-width: 360px;
  aspect-ratio: 9/16;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: 900px) {
    max-width: 100%;
    border-radius: 10px;
  }
`;


const PostHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(40, 20, 60, 0.25);
  display: flex;
  align-items: center;
  background: rgba(24, 18, 38, 0.85);
`;

const ProfileButton = styled.a`
  margin-left: auto;
  background: linear-gradient(90deg, #6a5acd 60%, #483d8b 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.95em;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(40, 20, 60, 0.18);
  transition: background 0.2s;

  &:hover {
    background: linear-gradient(90deg, #483d8b 60%, #6a5acd 100%);
    color: #ffd700;
  }
`;

const PostAvatar = styled.img`
  border-radius: 50%;
  object-fit: cover;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border: 2px solid rgba(80, 60, 120, 0.5);
`;

const PostUsername = styled.span`
  color: #e0e0ff;
  font-weight: bold;
  font-size: 1.1em;
`;

const PostTimestamp = styled.span`
  color: #b0a8d8;
  font-size: 0.85em;
  margin-left: auto;
`;

const PostImage = styled.div`
  width: 100%;
  aspect-ratio: 9/16;
  position: relative;
  background: linear-gradient(120deg, rgba(40, 20, 60, 0.7) 60%, rgba(24, 18, 38, 0.9) 100%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Changed to 'cover' to fill the container */
    background: #eee;
    display: block;
    position: static;
  }
`;

const PostCaption = styled.div`
  padding: 12px 16px;
  color: #e0e0ff;
  background: rgba(24, 18, 38, 0.85);
  font-size: 1em;
  border-top: 1px solid rgba(40, 20, 60, 0.25);
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  justify-content: center;
  align-items: start;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const PostModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 10px;
    align-items: center;
    height: 100vh;
  }
`;

const PostModalContent = styled.div`
  background-color: #fff;
  color: #222;
  border-radius: 8px;
  display: flex;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;

  @media (max-width: 1024px) {
    max-width: 95vw;
    max-height: 95vh;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    background: #fff;
    color: #222;
  }
`;

const ModalImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  position: relative;
  width: 100%;
  flex: 1; /* Changed to flex: 1 for 50/50 split */

  video, img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Changed back to contain for modal as per Instagram */
    background: black;
    display: block;
  }
`;

const ModalImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed back to contain for modal as per Instagram */

  &.modal-video, &.modal-image {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Changed back to contain */
    border-radius: 0;
  }
`;

const ModalDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-left: 1px solid #eee;
  flex: 1; /* Changed to flex: 1 for 50/50 split */
  background-color: #fff; /* Changed to white background */
  color: #222; /* Changed to black text */

  @media (max-width: 768px) {
    border-left: none;
    border-top: 1px solid #eee;
    background: transparent; /* Changed to transparent background */
  }
`;

const FollowButton = styled.a`
  background: #0095f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  margin-left: auto;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: #007bb5;
    color: #fff;
  }
`;

const ModalPostHeader = styled(PostHeader)`

  background: #696683ff; /* Changed to white background */
  color: #222;
`;

const ModalPostCaption = styled(PostCaption)`
  
  color: #222; /* Changed to black text */
  background: #fff;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 2em;
  color: #222;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #eee;
    color: #000;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    background: #fff; /* Changed to white background */
    color: #222; /* Changed to black text */
  }
`;

const NavButton = styled.button`
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 1.5em;
  z-index: 1001;
  position: absolute;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const PrevButton = styled(NavButton)`
  left: 10px;
`;

const NextButton = styled(NavButton)`
  right: 10px;
`;

const Post = () => {
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('posts');
  const touchStartY = useRef(0);

  const openModal = (index) => {
    setSelectedPostIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const videoElement = document.querySelector('#postModalVideo');
    if (videoElement) {
      videoElement.pause();
    }
    setIsModalOpen(false);
  };

  const navigatePosts = (direction) => {
    setSelectedPostIndex(prevIndex => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return mockPosts.length - 1;
      if (newIndex >= mockPosts.length) return 0;
      return newIndex;
    });
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    // Prevent default scroll behavior if swiping vertically within the modal
    const currentTouchY = e.touches[0].clientY;
    const diffY = currentTouchY - touchStartY.current;
    // Only prevent default if it's a significant vertical swipe
    if (Math.abs(diffY) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;

    if (diffY > 50) { // Swiped down
      navigatePosts(-1);
    } else if (diffY < -50) { // Swiped up
      navigatePosts(1);
    }
  };

  const currentPost = mockPosts[selectedPostIndex];

  return (
    <GradientBackground>
      <InfiniteTypingText text="Our Posts" />


      <ContentContainer>
        {activeSection === 'posts' && (
          <PostsGrid>
            {mockPosts.map((post, index) => (
              <PostCard key={post.id} onClick={() => openModal(index)}>
                <PostHeader>
                  <PostAvatar src={post.avatar} alt={post.username} />
                  <PostUsername>{post.username}</PostUsername>
                  <ProfileButton
                    href="https://www.instagram.com/optimus.orgz/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </ProfileButton>
                </PostHeader>
                <PostImage>
                  <VideoWithSound src={post.media} />
                </PostImage>
                <PostCaption>{post.caption}</PostCaption>
              </PostCard>
            ))}
          </PostsGrid>
        )}
        {activeSection === 'reels' && (
          <div>
            <h2>Reels Section (Placeholder)</h2>
            <p>Video reels will be displayed here.</p>
          </div>
        )}
        {activeSection === 'profile' && (
          <div>
            <h2>Profile Section (Placeholder)</h2>
            <p>User profile information will be displayed here.</p>
          </div>
        )}
      </ContentContainer>

      {isModalOpen && currentPost && (
        <PostModalOverlay onClick={e => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
          <PostModalContent
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ModalImageContainer>
              {currentPost.type === 'image' && (
                <ModalImage src={currentPost.media} alt="Post" className="modal-image" />
              )}
              {currentPost.type === 'video' && (
                <VideoWithSound
                  src={currentPost.media}
                />
              )}
            </ModalImageContainer>
            <ModalDetailsContainer>
              <ModalPostHeader>
                <PostAvatar src={currentPost.avatar} alt={currentPost.username} />
                <PostUsername>{currentPost.username}</PostUsername>
                <FollowButton
                  href="https://www.instagram.com/optimus.orgz/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow
                </FollowButton>
              </ModalPostHeader>
              <ModalPostCaption>{currentPost.caption}</ModalPostCaption>
              {/* Comments section can go here */}
            </ModalDetailsContainer>
          </PostModalContent>
        </PostModalOverlay>
      )}
    </GradientBackground>
  );
};

export default Post;
