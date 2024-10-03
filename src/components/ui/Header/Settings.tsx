import { Input } from "@/components/ui/input";

export type SettingValue = string | boolean;

interface Setting {
  label: string;
  type: "checkbox" | "text";
  value: SettingValue;
  default: SettingValue;
  onChange: (value: SettingValue) => void;
}

export interface SettingsMap {
  [key: string]: Setting;
}

function SettingsForm({ settingsMap }: { settingsMap: SettingsMap }) {
  return (
    <div className="flex flex-col space-y-4 border-t">
      <div className="flex flex-col items-left justify-start gap-2 mt-4">
        {Object.entries(settingsMap).map(([key, setting]) => (
          <div key={key} className="flex flex-row items-center gap-2">
            <label className="block text-sm font-medium">{setting.label}</label>
            {setting.type === "checkbox" && (
              <Input
                type="checkbox"
                checked={setting.value as boolean}
                onChange={(e) => setting.onChange(e.target.checked)}
                className="h-4 w-auto"
              />
            )}
            {setting.type === "text" && (
              <Input
                type="text"
                value={setting.value as string}
                onChange={(e) => setting.onChange(e.target.value)}
                className="h-4 w-auto"
              />
            )}
            {/* Add more input types if needed */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsForm;
