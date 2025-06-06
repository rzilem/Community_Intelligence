
import React from 'react';
import { SystemPreferences } from '@/types/settings-types';
import DefaultAssociationCard from '@/components/settings/preferences/DefaultAssociationCard';
import DateTimeSettingsCard from '@/components/settings/preferences/DateTimeSettingsCard';
import CurrencySettingsCard from '@/components/settings/preferences/CurrencySettingsCard';
import LanguageSettingsCard from '@/components/settings/preferences/LanguageSettingsCard';
import OtherPreferencesCard from '@/components/settings/preferences/OtherPreferencesCard';

interface SystemPreferencesTabProps {
  settings: SystemPreferences;
  onChange: (settings: Partial<SystemPreferences>) => void;
}

const SystemPreferencesTab: React.FC<SystemPreferencesTabProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      <DefaultAssociationCard 
        defaultAssociationId={settings.defaultAssociationId}
        onChange={(value) => onChange({ defaultAssociationId: value })}
      />

      <DateTimeSettingsCard 
        dateFormat={settings.defaultDateFormat}
        timeFormat={settings.defaultTimeFormat}
        onDateFormatChange={(format) => onChange({ defaultDateFormat: format })}
        onTimeFormatChange={(format) => onChange({ defaultTimeFormat: format })}
      />

      <CurrencySettingsCard 
        value={settings.defaultCurrency}
        onChange={(value) => onChange({ defaultCurrency: value })}
      />

      <LanguageSettingsCard 
        value={settings.defaultLanguage}
        onChange={(value) => onChange({ defaultLanguage: value })}
      />

      <OtherPreferencesCard
        autoSave={settings.autoSave}
        onAutoSaveChange={(checked) => onChange({ autoSave: checked })}
      />
    </div>
  );
};

export default SystemPreferencesTab;
