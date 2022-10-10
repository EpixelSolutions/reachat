import { Box, Tabs } from '@rocket.chat/fuselage';
import '@rocket.chat/fuselage-polyfills';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CertificatesTab } from './CertificatesTab';
import { GeneralTab } from './GeneralTab';

export const SettingsView: FC = () => {
  const isVisible = false
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState('general');

  return (
    <Box
      display={isVisible ? 'flex' : 'none'}
      flexDirection='column'
      height='full'
      backgroundColor='surface'
    >
      <Box
        width='full'
        minHeight={64}
        padding={24}
        display='flex'
        flexDirection='row'
        flexWrap='nowrap'
        color='default'
        fontScale='h1'
      >
        {t('settings.title')}
      </Box>

      <Tabs>
        <Tabs.Item
          selected={currentTab === 'general'}
          onClick={() => setCurrentTab('general')}
        >
          {t('settings.general')}
        </Tabs.Item>
        <Tabs.Item
          selected={currentTab === 'certificates'}
          onClick={() => setCurrentTab('certificates')}
        >
          {t('settings.certificates')}
        </Tabs.Item>
      </Tabs>
      <Box m='x24'>
        {(currentTab === 'general' && <GeneralTab />) ||
          (currentTab === 'certificates' && <CertificatesTab />)}
      </Box>
    </Box>
  );
};
