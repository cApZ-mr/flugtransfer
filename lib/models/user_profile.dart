class UserProfile {
  final String id;
  final String name;
  final String staffNumber;
  final String base;
  final String role;
  final String email;
  final String? icalFeedUrl;
  final DateTime? lastSync;

  const UserProfile({
    required this.id,
    required this.name,
    required this.staffNumber,
    required this.base,
    required this.role,
    required this.email,
    this.icalFeedUrl,
    this.lastSync,
  });

  UserProfile copyWith({
    String? name,
    String? staffNumber,
    String? base,
    String? role,
    String? email,
    String? icalFeedUrl,
    DateTime? lastSync,
  }) {
    return UserProfile(
      id: id,
      name: name ?? this.name,
      staffNumber: staffNumber ?? this.staffNumber,
      base: base ?? this.base,
      role: role ?? this.role,
      email: email ?? this.email,
      icalFeedUrl: icalFeedUrl ?? this.icalFeedUrl,
      lastSync: lastSync ?? this.lastSync,
    );
  }
}
