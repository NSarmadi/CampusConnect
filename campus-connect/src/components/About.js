// src/components/About.js

import React from 'react';
import styles from './About.module.css';

const About = () => {
  // Add team members' data here
  const teamMembers = [
    {
      name: 'Erik Connerty',
      email: 'erikc@cec.sc.edu',
      imageUrl: 'https://econnerty.github.io/static/media/profile_picture.309b7ef71615eb418517.jpg',
      description: 'Erik is a Ph.D student at the University of South Carolina and the lead developer of Campus Connect. (He\'s the one on the left)',
    },
    {
      name: 'Timothy Kranz',
      email: 'tkranz@email.sc.edu',
      imageUrl: 'https://img.youtube.com/vi/L4aMiWxlYxk/hqdefault.jpg',
      description: 'John is a Computer Engineering major and the UX/UI designer of Campus Connect.',
    },
    {
        name: 'Coby Arambula',
        email: 'cobya@email.sc.edu',
        imageUrl: 'https://example.com/jane-smith.jpg',
        description: 'John is a Computer Engineering major and the UX/UI designer of Campus Connect.',
      },
      {
        name: 'Chase Allison',
        email: 'challison@email.sc.edu',
        imageUrl: 'https://example.com/jane-smith.jpg',
        description: 'John is a Computer Engineering major and the UX/UI designer of Campus Connect.',
      },
      {
        name: 'Neekon Sarmadi',
        email: 'nsarmadi@email.sc.edu',
        imageUrl: 'https://example.com/jane-smith.jpg',
        description: 'John is a Computer Engineering major and the UX/UI designer of Campus Connect.',
      },
  ];

  return (
    <div>
      <h1>About Campus Connect</h1>
      <p>
        Campus Connect is a social media app designed to help students and faculty
        communicate and collaborate within their campus community.
      </p>
      <h2>Meet the Team</h2>
      <div className={styles.team_container}>
        {teamMembers.map((member, index) => (
          <div key={index} className={styles.team_member}>
            <img src={member.imageUrl} alt={``} />
            <h3 className={styles.name}>{member.name}</h3>
            <p className={styles.email}>{member.email}</p>
            <p className={styles.description}>{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
