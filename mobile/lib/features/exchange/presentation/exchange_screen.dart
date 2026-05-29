import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class ExchangeScreen extends StatelessWidget {
  const ExchangeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Обмен', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Отдаёте', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(color: AtlasColors.elevated, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.1))),
                          child: const Text('RUB ▾', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(child: TextField(decoration: InputDecoration(hintText: '0.00', border: InputBorder.none), textAlign: TextAlign.right, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600))),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Center(
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 40, height: 40,
                decoration: BoxDecoration(color: AtlasColors.card, shape: BoxShape.circle, border: Border.all(color: Colors.white.withOpacity(0.1))),
                child: const Icon(Icons.swap_vert, color: AtlasColors.accent, size: 20),
              ),
            ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Получаете', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(color: AtlasColors.elevated, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.1))),
                          child: const Text('USD ▾', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(child: Text('0.00', textAlign: TextAlign.right, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: AtlasColors.text))),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Row(children: [const Icon(Icons.refresh, size: 14, color: AtlasColors.accent), const SizedBox(width: 6), const Text('Курс', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14))]),
                      const Text('1 RUB = 0.0108 USD', style: TextStyle(color: AtlasColors.text, fontSize: 14)),
                    ]),
                    const SizedBox(height: 8),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      const Text('Комиссия', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                      const Text('0.1%', style: TextStyle(color: AtlasColors.success, fontSize: 14)),
                    ]),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () {}, child: const Text('Обменять'))),
          ],
        ),
      ),
    );
  }
}
