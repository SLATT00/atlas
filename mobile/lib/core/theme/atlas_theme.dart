import 'package:flutter/material.dart';

class AtlasColors {
  static const bg = Color(0xFF0B0E13);
  static const bgSecondary = Color(0xFF121722);
  static const card = Color(0xFF181E2B);
  static const elevated = Color(0xFF1E2433);
  static const text = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFAAB3C5);
  static const muted = Color(0xFF7D8797);
  static const success = Color(0xFF17D97A);
  static const warning = Color(0xFFF5B84D);
  static const error = Color(0xFFFF5A6B);
  static const accent = Color(0xFF3BC6C4);
  static const accentAlt = Color(0xFF4ED7D3);
}

class AtlasTheme {
  static ThemeData get dark {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AtlasColors.bg,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: AtlasColors.accent,
        secondary: AtlasColors.accentAlt,
        surface: AtlasColors.card,
        error: AtlasColors.error,
        onPrimary: AtlasColors.bg,
        onSecondary: AtlasColors.bg,
        onSurface: AtlasColors.text,
        onError: AtlasColors.text,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AtlasColors.bg,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AtlasColors.text,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: AtlasColors.textSecondary),
      ),
      cardTheme: CardTheme(
        color: AtlasColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.05)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AtlasColors.accent,
          foregroundColor: AtlasColors.bg,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AtlasColors.text,
          side: BorderSide(color: Colors.white.withOpacity(0.1)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AtlasColors.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AtlasColors.accent),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AtlasColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: AtlasColors.muted),
        labelStyle: const TextStyle(color: AtlasColors.textSecondary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AtlasColors.bg,
        selectedItemColor: AtlasColors.accent,
        unselectedItemColor: AtlasColors.muted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
      dividerTheme: DividerThemeData(
        color: Colors.white.withOpacity(0.05),
        thickness: 1,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AtlasColors.text),
        headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AtlasColors.text),
        headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: AtlasColors.text),
        titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AtlasColors.text),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: AtlasColors.text),
        bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: AtlasColors.text),
        bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AtlasColors.textSecondary),
        bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AtlasColors.muted),
      ),
    );
  }
}
