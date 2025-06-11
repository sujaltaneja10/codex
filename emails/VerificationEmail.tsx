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

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  name,
  verificationUrl,
}: VerificationEmailProps) => {
  if (!process.env.PROJECT_NAME) {
    throw new Error('PROJECT_NAME environment variable is not defined');
  }

  return (
    <Html>
      <Head />
      <Preview>
        Verify your email to complete your {process.env.PROJECT_NAME}{' '}
        registration
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Welcome to {process.env.PROJECT_NAME}, {name}!
          </Heading>
          <Text style={paragraph}>
            We're excited to have you. Please click the button below to verify
            your email address and activate your account.
          </Text>
          <Button style={button} href={verificationUrl}>
            Verify Your Email
          </Button>
          <Text style={paragraph}>
            If you did not sign up for this account, you can safely ignore this
            email.
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
