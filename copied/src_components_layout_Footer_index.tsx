import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  text-align: center;
  color: #666;
`;

const Footer = () => (
    <FooterWrapper>
        © {new Date().getFullYear()}, made with ❤️ by Jax.
    </FooterWrapper>
);

export default Footer;