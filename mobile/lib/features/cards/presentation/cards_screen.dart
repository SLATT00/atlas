import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class CardsScreen extends StatelessWidget {
  const CardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Карты', style: Theme.of(context).textTheme.headlineMedium),
                OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 16), label: const Text('Заказать')),
              ],
            ),
            const SizedBox(height: 20),
            _cardWidget(context, 'Atlas Metal', '4829', 'Visa', '12/2028', true),
            const SizedBox(height: 16),
            _cardWidget(context, 'Atlas Virtual', '7712', 'Mastercard', '06/2027', true),
            const SizedBox(height: 16),
            _cardWidget(context, 'Atlas Travel', '3301', 'Visa', '03/2028', false),
          ],
        ),
      ),
    );
  }

  Widget _cardWidget(BuildContext context, String name, String last4, String network, String expiry, bool active) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.grey.shade800, Colors.grey.shade900],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AtlasColors.text)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (active ? AtlasColors.success : AtlasColors.warning).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(active ? 'Активна' : 'Заморожена', style: TextStyle(fontSize: 11, color: active ? AtlasColors.success : AtlasColors.warning)),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text('•••• •••• •••• $last4', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600, letterSpacing: 2, color: AtlasColors.text)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(expiry, style: const TextStyle(fontSize: 12, color: AtlasColors.textSecondary)),
              Text(network, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AtlasColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}
