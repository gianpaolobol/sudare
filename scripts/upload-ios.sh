#!/usr/bin/env bash
set -euo pipefail

for secret in IOS_DISTRIBUTION_P12_BASE64 IOS_DISTRIBUTION_P12_PASSWORD IOS_PROFILE_BASE64 ASC_KEY_P8_BASE64 ASC_KEY_ID ASC_ISSUER_ID; do
  if [[ -z "${!secret:-}" ]]; then
    echo "::error::Missing GitHub Actions secret: $secret"
    exit 1
  fi
done

bundle_id=it.gianpaolofranceschini.sudare
team_id=BX9MDXAHKG
working_dir="$(mktemp -d)"
keychain="$working_dir/signing.keychain-db"
keychain_password="$(openssl rand -hex 24)"
private_key="$HOME/.appstoreconnect/private_keys/AuthKey_${ASC_KEY_ID}.p8"
profile_path=
cleanup() {
  security delete-keychain "$keychain" >/dev/null 2>&1 || true
  rm -f "$private_key"
  if [[ -n "$profile_path" ]]; then rm -f "$profile_path"; fi
  rm -rf "$working_dir"
}
trap cleanup EXIT

printf '%s' "$IOS_DISTRIBUTION_P12_BASE64" | base64 -D > "$working_dir/distribution.p12"
printf '%s' "$IOS_PROFILE_BASE64" | base64 -D > "$working_dir/profile.mobileprovision"
security cms -D -i "$working_dir/profile.mobileprovision" -o "$working_dir/profile.plist"
profile_uuid="$(/usr/libexec/PlistBuddy -c 'Print :UUID' "$working_dir/profile.plist")"
profile_app="$(/usr/libexec/PlistBuddy -c 'Print :Entitlements:application-identifier' "$working_dir/profile.plist")"
[[ "$profile_app" == "$team_id.$bundle_id" ]] || { echo 'Provisioning profile does not match Sudare'; exit 1; }

umask 077
mkdir -p "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles" "$(dirname "$private_key")"
profile_path="$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles/$profile_uuid.mobileprovision"
cp "$working_dir/profile.mobileprovision" "$profile_path"
printf '%s' "$ASC_KEY_P8_BASE64" | base64 -D > "$private_key"

security create-keychain -p "$keychain_password" "$keychain"
security set-keychain-settings -lut 3600 "$keychain"
security unlock-keychain -p "$keychain_password" "$keychain"
security list-keychains -d user -s "$keychain" "$HOME/Library/Keychains/login.keychain-db"
security import "$working_dir/distribution.p12" -k "$keychain" -P "$IOS_DISTRIBUTION_P12_PASSWORD" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$keychain_password" "$keychain" >/dev/null
identity="$(security find-identity -v -p codesigning "$keychain" | awk '$1 == "1)" { print $2 }')"
[[ "$identity" =~ ^[[:xdigit:]]{40}$ ]] || { echo 'No valid distribution identity found'; exit 1; }


cat > "$working_dir/export.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>signingStyle</key><string>manual</string>
  <key>teamID</key><string>$team_id</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
  <key>provisioningProfiles</key><dict><key>$bundle_id</key><string>$profile_uuid</string></dict>
</dict>
</plist>
PLIST

xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$working_dir/Sudare.xcarchive" \
  DEVELOPMENT_TEAM="$team_id" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="$identity" \
  PROVISIONING_PROFILE_SPECIFIER="$profile_uuid" CURRENT_PROJECT_VERSION="$GITHUB_RUN_NUMBER.$GITHUB_RUN_ATTEMPT" archive
xcodebuild -exportArchive -archivePath "$working_dir/Sudare.xcarchive" \
  -exportPath "$working_dir/export" -exportOptionsPlist "$working_dir/export.plist"
shopt -s nullglob
ipas=("$working_dir/export/"*.ipa)
[[ ${#ipas[@]} -eq 1 ]] || { echo 'Expected a single signed IPA'; exit 1; }
xcrun altool --upload-app --type ios --file "${ipas[0]}" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
