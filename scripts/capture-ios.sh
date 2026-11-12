#!/usr/bin/env bash
set -euo pipefail
device="$(xcrun simctl list devices available -j | python3 -c '
import json, sys
devices = json.load(sys.stdin)["devices"]
for runtime in sorted(devices, reverse=True):
    for device in devices[runtime]:
        if device["name"] == "iPhone 17 Pro Max":
            print(device["udid"])
            sys.exit(0)
sys.exit("iPhone 17 Pro Max simulator is missing")
')"
xcrun simctl boot "$device"
trap 'xcrun simctl shutdown "$device" || true' EXIT
xcrun simctl bootstatus "$device" -b
xcrun simctl status_bar "$device" override --time '9:41' --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState discharging --batteryLevel 100
xcrun simctl ui "$device" appearance light
xcrun simctl install "$device" "$RUNNER_TEMP/sudare-build/Build/Products/Release-iphonesimulator/App.app"
xcrun simctl launch "$device" it.gianpaolofranceschini.sudare
sleep 5
mkdir -p build/screenshots
xcrun simctl io "$device" screenshot "$RUNNER_TEMP/sudare-scopri.png"
sips -s format jpeg -s formatOptions best "$RUNNER_TEMP/sudare-scopri.png" --out build/screenshots/sudare-scopri.jpg
sips -g pixelWidth -g pixelHeight build/screenshots/sudare-scopri.jpg | python3 -c '
import sys
image = sys.stdin.read()
if "pixelWidth: 1320" not in image or "pixelHeight: 2868" not in image:
    sys.exit(image)
'
