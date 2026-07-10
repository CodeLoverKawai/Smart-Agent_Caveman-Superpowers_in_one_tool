---
name: ada-hardware
description: Use when writing embedded firmware, hardware description files (Verilog/VHDL), or analyzing physical circuitry.
---
# ada-hardware

- Hardware & Firmware Development Rules:
  - Embedded constraints: Strictly utilize static memory allocation in C/C++ (ESP-IDF, Zephyr). Keep Interrupt Service Routines (ISRs) minimal.
  - State machines: Model interfaces (UART, SPI, I2C, CAN) as explicit state machines with detailed state variables.
  - Synthesizable RTL: Write clean, synthesizable Verilog/SystemVerilog. Align signals to standard bus architectures (AXI, AHB).
  - RTL validation: Accompany hardware modules with self-checking testbenches. Verify logic via simulators (iverilog, ModelSim) before synthesis.
