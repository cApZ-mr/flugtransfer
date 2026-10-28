import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/roster_shift.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';

class CalendarScreen extends StatefulWidget {
  final VoidCallback onNavigateToSettings;
  const CalendarScreen({super.key, required this.onNavigateToSettings});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final shifts = roster.myShifts;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.flight_takeoff, color: Color(0xFF38BDF8), size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Flugtransfer',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  '${roster.userProfile.name} • ${roster.userProfile.base}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF94A3B8)),
            onPressed: widget.onNavigateToSettings,
            tooltip: 'Einstellungen & iCal',
          ),
        ],
      ),
      body: Column(
        children: [
          // Date Selector Header
          _buildMonthHeader(),

          // Main Content: Empty State OR Shift List
          Expanded(
            child: shifts.isEmpty
                ? _buildEmptyState(context, roster)
                : _buildShiftsList(context, roster, shifts),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            DateFormat('MMMM yyyy', 'de_DE').format(_selectedDate),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left, color: Color(0xFF94A3B8)),
                onPressed: () {
                  setState(() {
                    _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1, 1);
                  });
                },
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                onPressed: () {
                  setState(() {
                    _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1, 1);
                  });
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, RosterProvider roster) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.3)),
              ),
              child: const Icon(Icons.calendar_month, color: Color(0xFF38BDF8), size: 48),
            ),
            const SizedBox(height: 16),
            const Text(
              'Kein Dienstplan geladen',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Füge deinen persönlichen Dienstplan über deinen Apple iCal Link ein oder teste die App mit Muster-Schichten.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), height: 1.4),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: widget.onNavigateToSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: BorderRadius.circular(10),
              ),
              icon: const Icon(Icons.link, size: 18),
              label: const Text('Apple iCal Link einfügen'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => roster.loadSampleShifts(),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF38BDF8),
                side: const BorderSide(color: Color(0xFF1E293B)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: BorderRadius.circular(10),
              ),
              icon: const Icon(Icons.science_outlined, size: 16),
              label: const Text('Muster-Dienstplan laden'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShiftsList(BuildContext context, RosterProvider roster, List<RosterShift> shifts) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: shifts.length,
      itemBuilder: (context, index) {
        final shift = shifts[index];
        return _buildShiftCard(context, roster, shift);
      },
    );
  }

  Widget _buildShiftCard(BuildContext context, RosterProvider roster, RosterShift shift) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0284C7).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      shift.flightNumber,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF38BDF8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (shift.aircraftType != null)
                    Text(
                      shift.aircraftType!,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  shift.dutyRole,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shift.departureIata,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      DateFormat('HH:mm').format(shift.departureTime) + ' UTC',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward, color: Color(0xFF64748B), size: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      shift.arrivalIata,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      DateFormat('HH:mm').format(shift.arrivalTime) + ' UTC',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${shift.formattedDate} • ${shift.durationFormatted}',
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              TextButton.icon(
                onPressed: () => _showOfferDialog(context, roster, shift),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF38BDF8),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                ),
                icon: const Icon(Icons.swap_horiz, size: 16),
                label: const Text('In Börse anbieten'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showOfferDialog(BuildContext context, RosterProvider roster, RosterShift shift) {
    ListingType type = ListingType.swap;
    final notesController = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Schicht anbieten: ${shift.flightNumber}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${shift.routeFormatted} am ${shift.formattedDate}',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text('Tauschen')),
                          selected: type == ListingType.swap,
                          selectedColor: const Color(0xFF0284C7),
                          onSelected: (val) {
                            if (val) setSheetState(() => type = ListingType.swap);
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text('Abgeben')),
                          selected: type == ListingType.giveaway,
                          selectedColor: const Color(0xFF0284C7),
                          onSelected: (val) {
                            if (val) setSheetState(() => type = ListingType.giveaway);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: notesController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: type == ListingType.swap ? 'Tauschwunsch / Bemerkung' : 'Grund / Bemerkung',
                      labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: BorderRadius.circular(10),
                      ),
                      onPressed: () {
                        roster.postShiftToMarketplace(
                          shift: shift,
                          type: type,
                          notes: notesController.text.trim().isEmpty ? null : notesController.text.trim(),
                        );
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Schicht erfolgreich in der Flugtransfer-Börse veröffentlicht!'),
                            backgroundColor: Color(0xFF10B981),
                          ),
                        );
                      },
                      child: const Text('In Flugtransfer-Börse veröffentlichen', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
