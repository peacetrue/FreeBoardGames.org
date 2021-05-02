import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import * as RTL from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import { LinkProps } from 'next/link';
import mockedEnv from 'mocked-env';
import NextI18Next from 'next-i18next';
import { Link } from 'next-i18next';

describe('Link', () => {
  let nextI18Next: NextI18Next;
  let Link: Link;

  beforeEach(() => {
    const restore = mockedEnv({ NEXT_PUBLIC_I18N_ENABLED: 'true' });
    afterEach(restore);
  });

  beforeEach(async () => {
    nextI18Next = require('../config').nextI18Next;
    Link = require('./Link').Link;
  });

  beforeEach(() => {
    const { language } = nextI18Next.i18n;
    afterAll(() => {
      nextI18Next.i18n.changeLanguage(language);
    });
  });

  describe('when translated route is available', () => {
    it('replaces the href property for it ', async () => {
      await forGivenLanguage('pt');
      renderLink('Play bingo', { href: '/play/bingo' });
      await thenLinkShouldHave('Play bingo', { href: '/pt/jogar/bingo' });
    });

    it('does not render Link whe using a invalid language', async () => {
      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();

      await forGivenLanguage('invalid');

      expect(() => {
        renderLink('Play chess', { href: '/play/chess' });
      }).toThrow('Invalid configuration: Current language is not included in all languages array');

      jest.restoreAllMocks();
    });

    it('does not change url for non-translated path ', async () => {
      await forGivenLanguage('pt');
      renderLink('Play unknown', { href: '/unknown/path' });
      await thenLinkShouldHave('Play unknown', { href: '/pt/unknown/path' });
    });
  });

  async function forGivenLanguage(language: string) {
    return nextI18Next.i18n.changeLanguage(language);
  }

  function renderLink(text: string, props: Pick<LinkProps, 'href'>) {
    RTL.render(<Link {...props}>{text}</Link>);
  }

  async function thenLinkShouldHave(text: string, props: Pick<LinkProps, 'href'>) {
    await waitFor(() => {
      Object.entries(props).forEach(([key, value]) => {
        expect(screen.getByText(text)).toHaveAttribute(key, value);
      });
    });
  }
});