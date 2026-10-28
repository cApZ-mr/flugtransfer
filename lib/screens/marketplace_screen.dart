import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/market_listing.dart';
import '../models/roster_shift.dart';
import '../services/roster_provider.dart';
import 'chat_room_screen.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  String _filterType = 'all'; // 'all', 'giveaway', 'swap'
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final listings = roster.marketplaceListings.where((item) {
      if (_filterType == 'giveaway' && item.type != ListingType.giveaway) return false;
      if (_filterType == 'swap' && item.type != ListingType.swap) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchFlight = item.shift.flightNumber.toLowerCase().contains(q);
        final matchRoute = item.shift.routeFormatted.toLowerCase().contains(q);
        final matchName = item.colleagueName.toLowerCase().contains(q);
        return matchFlight || matchRoute || matchName;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Flugtransfer Börse',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs & Search
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0F172A),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Nach Flugnummer, Route oder Kollege suchen...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B), size: 20),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildFilterChip('Alle', 'all'),
                    const SizedBox(width: 8),
                    _buildFilterChip('Abgeben', 'giveaway'),
                    const SizedBox(width: 8),
                    _buildFilterChip('Tauschen', 'swap'),
                  ],
                ),
              ],
            ),
          ),

          // Listing Count Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF090D16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${listings.length} Schichten verfügbar',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                ),
                const Text(
                  'Live-Aktualisierung',
                  style: TextStyle(fontSize: 11, color: Color(0xFF10B981)),
                ),
              ],
            ),
          ),

          // Listings List
          Expanded(
            child: listings.isEmpty
                ? const Center(
                    child: Text('Keine Schichten gefunden.', style: TextStyle(color: Color(0xFF64748B))),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: listings.length,
                    itemBuilder: (context, index) {
                      final item = listings[index];
                      return _buildMarketplaceCard(context, roster, item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filterType == value;
    return GestureDetector(
      onTap: () => setState(() => _filterType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
          ),
        ),
      ),
    );
  }

  Widget _buildMarketplaceCard(BuildContext context, RosterProvider roster, MarketListing item) {
    Color statusColor;
    Color statusBg;
    switch (item.status) {
      case TradeStatus.open:
        statusColor = const Color(0xFF34D399); // Emerald
        statusBg = const Color(0xFF065F46).withOpacity(0.3);
        break;
      case TradeStatus.inNegotiation:
        statusColor = const Color(0xFFFBBF24); // Amber
        statusBg = const Color(0xFF78350F).withOpacity(0.3);
        break;
      case TradeStatus.completed:
        statusColor = const Color(0xFF94A3B8); // Slate
        statusBg = const Color(0xFF334155).withOpacity(0.3);
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: item.status == TradeStatus.inNegotiation
              ? const Color(0xFFF59E0B).withOpacity(0.3)
              : const Color(0xFF1E293B),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Type pill + Status chip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: item.type == ListingType.swap
                      ? const Color(0xFF38BDF8).withOpacity(0.15)
                      : const Color(0xFFA78BFA).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  item.type == ListingType.swap ? 'Tausch' : 'Abgabe',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: item.type == ListingType.swap ? const Color(0xFF38BDF8) : const Color(0xFFA78BFA),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withOpacity(0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      item.status.label,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Flight & Route
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.shift.flightNumber,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    '${item.shift.routeFormatted} • ${item.shift.formattedDate}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
              Text(
                item.shift.formattedTimeRange,
                style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8), fontWeight: FontWeight.w500),
              ),
            ],
          ),

          if (item.notes != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '„${item.notes!}”',
                style: const TextStyle(fontSize: 12, color: Color(0xFFCBD5E1), fontStyle: FontStyle.italic),
              ),
            ),
          ],

          const SizedBox(height: 12),
          const Divider(color: Color(0xFF1E293B), height: 1),
          const SizedBox(height: 12),

          // Footer: Colleague + Views/Inquiries counter + Action Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.colleagueName,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                  Text(
                    '${item.colleagueRole} • Base ${item.colleagueBase}',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.visibility_outlined, size: 12, color: Color(0xFF64748B)),
                      const SizedBox(width: 4),
                      Text('${item.viewsCount} Aufrufe', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      const SizedBox(width: 8),
                      const Icon(Icons.chat_bubble_outline, size: 12, color: Color(0xFF64748B)),
                      const SizedBox(width: 4),
                      Text('${item.inquiriesCount} Anfragen', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    ],
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  final chatId = roster.openChatForListing(item);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ChatRoomScreen(negotiationId: chatId),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.chat, size: 16),
                label: const Text('Verhandeln', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
