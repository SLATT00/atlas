import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  int _step = 1;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('ATLAS', style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text('Создайте аккаунт', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(child: Container(height: 3, decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, borderRadius: BorderRadius.circular(2)))),
                  const SizedBox(width: 8),
                  Expanded(child: Container(height: 3, decoration: BoxDecoration(color: _step >= 2 ? Theme.of(context).colorScheme.primary : Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(2)))),
                ],
              ),
              const SizedBox(height: 32),
              if (_step == 1) ...[
                TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
                const SizedBox(height: 16),
                TextField(controller: _phoneController, decoration: const InputDecoration(labelText: 'Телефон', hintText: '+7 (999) 123-45-67'), keyboardType: TextInputType.phone),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => setState(() => _step = 2), child: const Text('Далее'))),
              ],
              if (_step == 2) ...[
                TextField(controller: _passwordController, decoration: const InputDecoration(labelText: 'Пароль', hintText: 'Минимум 12 символов'), obscureText: true),
                const SizedBox(height: 16),
                TextField(controller: _confirmController, decoration: const InputDecoration(labelText: 'Подтвердите пароль'), obscureText: true),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: OutlinedButton(onPressed: () => setState(() => _step = 1), child: const Text('Назад'))),
                    const SizedBox(width: 12),
                    Expanded(child: ElevatedButton(onPressed: _loading ? null : () {}, child: const Text('Создать'))),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              TextButton(onPressed: () {}, child: const Text('Уже есть аккаунт? Войти')),
            ],
          ),
        ),
      ),
    );
  }
}
