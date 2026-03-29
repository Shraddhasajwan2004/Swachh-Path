// src/hooks/useBluetooth.ts

import { useState, useRef, useCallback } from 'react';

const SERVICE_UUID        = 'd0e8b37e-1234-11ed-861d-0242ac110002';
const CHARACTERISTIC_UUID = '00e8b37e-5678-11ed-861d-0242ac110003';

export type BLEStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseBluetooth {
  status:         BLEStatus;
  deviceName:     string | null;
  errorMsg:       string | null;
  connect:        () => Promise<void>;
  disconnect:     () => void;
  sendBLECommand: (command: 'dry open' | 'wet open') => Promise<void>;
}

export function useBluetooth(): UseBluetooth {
  const [status,     setStatus]     = useState<BLEStatus>('disconnected');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  const deviceRef         = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setErrorMsg('Web Bluetooth not supported. Use Chrome or Edge browser on HTTPS or localhost.');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      setErrorMsg(null);

      // ── FIX: Use namePrefix filter only (most compatible with NimBLE) ──────
      // Using both `name` + `services` filters together can cause Chrome to
      // not show the device. namePrefix alone is more reliable with NimBLE.
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'SMART_BIN' },
        ],
        optionalServices: [SERVICE_UUID],  // must list UUID here too for access
      });

      deviceRef.current = device;
      setDeviceName(device.name || 'SMART_BIN');

      // Handle if ESP32 goes out of range or powers off
      device.addEventListener('gattserverdisconnected', () => {
        setStatus('disconnected');
        setDeviceName(null);
        characteristicRef.current = null;
        console.log('[BLE] Device disconnected unexpectedly');
      });

      // ── Step 1: Connect to GATT server ────────────────────────────────────
      console.log('[BLE] Connecting to GATT server...');
      const server = await device.gatt!.connect();
      console.log('[BLE] GATT connected');

      // ── Step 2: Get service ───────────────────────────────────────────────
      // Small delay helps NimBLE finish service discovery after connect
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[BLE] Getting primary service...');
      const service = await server.getPrimaryService(SERVICE_UUID);
      console.log('[BLE] Service found');

      // ── Step 3: Get characteristic ────────────────────────────────────────
      console.log('[BLE] Getting characteristic...');
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      console.log('[BLE] Characteristic found, ready to write');

      characteristicRef.current = characteristic;
      setStatus('connected');

    } catch (err: any) {
      console.error('[BLE] Error:', err.name, err.message);

      // User closed the picker without selecting — not a real error
      if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
        setStatus('disconnected');
        return;
      }

      // Map common errors to helpful messages
      if (err.name === 'NetworkError') {
        setErrorMsg('Could not connect to bin. Make sure ESP32 is powered on and showing "Advertising" in Serial Monitor.');
      } else if (err.name === 'NotSupportedError') {
        setErrorMsg('Service UUID not found on this device. Check that your Arduino code is running correctly.');
      } else if (err.message?.includes('GATT')) {
        setErrorMsg('GATT connection failed. Power cycle the ESP32 and try again.');
      } else {
        setErrorMsg(err.message || 'Connection failed. Try power cycling the ESP32.');
      }

      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current         = null;
    characteristicRef.current = null;
    setStatus('disconnected');
    setDeviceName(null);
  }, []);

  const sendBLECommand = useCallback(async (command: 'dry open' | 'wet open') => {
    if (!characteristicRef.current) {
      setErrorMsg('Not connected. Please connect to a bin first.');
      return;
    }
    try {
      const encoder = new TextEncoder();
      const data    = encoder.encode(command);
      await characteristicRef.current.writeValue(data);
      console.log(`[BLE] Sent: "${command}"`);
    } catch (err: any) {
      console.error('[BLE] Write error:', err);
      setErrorMsg(`Failed to send command: ${err.message}`);
      if (!deviceRef.current?.gatt?.connected) {
        setStatus('disconnected');
      }
    }
  }, []);

  return { status, deviceName, errorMsg, connect, disconnect, sendBLECommand };
}