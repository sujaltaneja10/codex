import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { config } from '@/lib/config';

interface ResetPasswordEmailProps {
  name: string;
  url: string;
}

export const ResetPasswordEmail = ({ name, url }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Click on the link to reset your {config.PROJECT_NAME} password
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Welcome back to {config.PROJECT_NAME}, {name}!
          </Heading>
          <Text style={paragraph}>
            We're excited to have you back. Please click the button below to
            reset your password and gain access back to your account.
          </Text>
          <Button style={button} href={url}>
            Forgot Password
          </Button>
          <Text style={paragraph}>
            If you did not send this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// STYLES FOR EMAIL

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};
