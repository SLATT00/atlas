import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: AtlasColors.accent.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Text('МИ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: AtlasColors.accent)),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Михаил Иванов', style: Theme.of(context).textTheme.headlineSmall),
                    const Text('Premium', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _statusChip('Активен', AtlasColors.success),
                    _statusChip('Verified', AtlasColors.success),
                    _statusChip('Premium', AtlasColors.accent),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            _menuItem(Icons.person_outline, 'Личные данные', null),
            _menuItem(Icons.shield_outlined, 'Безопасность', null),
            _menuItem(Icons.verified_outlined, 'Верификация', 'Подтверждён'),
            _menuItem(Icons.notifications_outlined, 'Уведомления', null),
            _menuItem(Icons.fingerprint, 'Биометрия', null),
            _menuItem(Icons.smartphone, 'Устройства', '3'),
            _menuItem(Icons.settings_outlined, 'Настройки', null),
            _menuItem(Icons.language, 'Язык', 'Русский'),
            _menuItem(Icons.help_outline, 'Поддержка', null),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.logout, color: AtlasColors.error),
                label: const Text('Выйти', style: TextStyle(color: AtlasColors.error)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: color)),
    );
  }

  Widget _menuItem(IconData icon, String label, String? badge) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 4),
        leading: Icon(icon, color: AtlasColors.textSecondary, size: 22),
        title: Text(label, style: const TextStyle(fontSize: 16, color: AtlasColors.text)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badge != null) Text(badge, style: const TextStyle(fontSize: 12, color: AtlasColors.muted)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: AtlasColors.muted, size: 20),
          ],
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onTap: () {},
      ),
    );
  }
}
