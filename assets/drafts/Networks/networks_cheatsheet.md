# Networking fundamentals cheatsheet
## Abbreviations
- P2P, Peer-To-Peer: A single computer can act as both client and server.
- NIC, Network Interface Card:  NIC physically connects the end device to the network.
- SOHO, Small Office / Home Office: A common type of network.
- Internet, Interconnected Networks: A worldwide collection of internetworks or internet for short.
- LAN, Local Area Network: A common type of network infrastructure.
- WAN, Wide Area Network: A common type of network infrastructure over a wide geographical area.
- (I)SP, (Internet) Service Provider: A company providing and managing broadband services.
- Intranet: A private connection of LANs and WANs.
- Extranet: LANs and WANS only accessible by the organization's members.
- DSL, Digital Subscriber Line: Telephone lines.
- ADSL, Asynchronous Digital Subscriber Line: Asynchronous telephone lines.
- QoS, Quality of Service: A network reliability & architectural principle.
- The CIA triad, The Confidentiality, Integrity and Availability triad: Information security requirements.
- DoS, Denial of Service: Slows down or crashes network applications.
- ACLs, Access Control Lists: Filters traffic by IP or applications.
- IPS, Intrusion Prevention Systems: Detects spreading attacks on a network.
- VPNs, Virtual Private Networks: A secure remote access protocol.
- VTY, Virtual TeleType: Logical software-based lines or interfaces on networks devices (Telnet, SSH).
- NVRAM, Non-Volatine Random Access Memory: Storage for basic I/O operations & configuration contents.
- RAM, Random Access Memory: Currently used / running temporary storage.
- IP, Internet Protocol: Network interface identification and addressing protocol.
- BYOD, Bring Your Own Device: Users connect any device of their own, anywhere, for any purpose to the network.
- Mask, Subnet mask: A 32-bit value separating network vs host portions (e.g: `255.255.255.0`)
- SVIs, Switch Virtual Interfaces: Special virtual ports that let you assign IPs for remote management.
- DNS, Domain Name System: A protocol used to translate domain names to IP addresses.
- DHCP, Dynamic Host Configuration Protocol: A protocol that automatically assigns IP addresses and other critical network settings to hosts.
- VLAN, Virtual Local Area Network: A logical network segmentation.
- OSI model, The Open System Interconnection model: A reference model aiding in teaching & designing networking standards.
- PDU, Protocol Data Unit: The result of (de-)encapsulation (E.g: Data, Segment, Packet, Frame or Bits).
- WLAN, Wireless Local Area Network: LANs using wireless IEEE 802.11 standards.
- MAN, Metropolitan Area Network: A city or large campus network, larger than a LAN but smaller than a WAN.
- (W)PAN, (Wireless) Personal Area Network: An individual's immediate workspace network, just a few meters.
- Kbps, Mbps, Gbps: Kilobits-, Megabits- or Gigabits per second: A common bandwidth throughput measurement.
- UTP cable, Unshielded Twisted Pair cable: A common physical copper cabling medium.
- STP cable, Shielded Twisted Pair cable: A common physical copper cabling medium.
- BNC connector, Bayonet Neill-Concelman connector: A coaxial cable connector type.
- EMI, Electromagnetic Interference: Electromagnetic signals that can distort and corrupt the data signals being carried by copper media.
- RMI, Radio frequency Interference: Radio frequency signals that can distort and corrupt the data signals being carried by copper media.
- CAT5e cable, Category 5e cable: A common UTP cable that is the minimally acceptable modern-day standard.
- RJ-45 plug, RJ-45 UTP connector plugs: A male UTP cable terminator plug.
- Auto-MDIX, Automatic Medium-Dependent Interface Crossover: A system that automatically detects and adjusts for straight-through or crossover cables.
- T568A & T568B: Common copper cable wiring standards.
- FTTH, Fiber-To-The-Home: Always-on fiber-optic broadband services to homes.
- SMF, Single-Mode Fiber-optic: A type of fiber-optic media.
- MMF, Multi-Mode Fiber-optic: A type of fiber-optic media.
- SFP module, small form-factor pluggable transceiver module: A switch or router interface for fiber-optic connector types.
- ST connector, Straight-Tip connector: A fiber-optic connector.
- SC connector, Subscriber connector: A fiber-optic connector.
- LC connector, Lucent-Simplex connector: A fiber-optic connector.
- LC connector, Duplex multi-mode LC connector: A fiber-optic connector.
- Wi-Fi: WLAN technology using IEEE 802.11 standards.
- BT, Bluetooth: PAN technology using IEEE 802.15 standards.
- (W)AP, (Wireless) Access Point: A networking device that allows wireless-capable devices to connect to a wired network.
- CSMA/CD, Carrier sense multiple access with collision detection: A protocol that governs when nodes can communicate.
- CSMA/CA, Carrier sense multiple access with collision avoidance: A protocol that governs when nodes can communicate.
- LLC, Logical Link Control: An ethernet IEEE 802.2 standard protocol that identifies data and who should receive it at the Data Link Layer (L2) level.
- ARP, Address Resolution Protocol: A protocol that translates IPv4 addresses to MAC addresses.
- FCS, Frame Check Sequence: A data link frame trailer field used for error detection.
- CRC value, Cyclic Redundancy Check value:  A mathematical summary of all bits in a frame, placed in the FCS field.
- PPP, Point-To-Point Protocol: A legacy WAN data link layer (L2) protocol.
- HDLC, High-Level Data Link Control: A legacy WAN data link layer (L2) protocol.
- ATM, Asynchronous Transfer Mode: A legacy WAN data link layer (L2) protocol.
- OUI, Organizationally Unique Identifier: The first 6 hexadecimal digits of a MAC address.
- BIA, Burned-In-Address = MAC address
- STP, Spanning Tree Protocol: N/A
- LLDP, Link Layer Discovery Protocol: N/A
- CAM-table, Content Addressable Memory Table: A switch's MAC address table.
- OSPF, Open Shortest Path First: A dynamic routing protocol.
- MTU, Maximum Transmission Unit: The largest PDU a medium can carry.
- IHL, Internet Header Length: IPv4 header field, identifies header size and total packet size.
- DS or DiffServ, Differentiated Services: IPv4 header field, Defines packet priority (QoS).
- DSCP, Differentiated Services Code Point: DS subfield.
- ECN, Explicit Congestion Notation: DS subfield.
- TTL, Time-To-Live: IPv4 header field, essentially counts how many hops the packet can go through before it's discarded. Decreases by 1 per hop.
- EIGRP, Enhanced Interior Gateway Protocol: A dynamic routing protocol.
- ARP table or ARP cache: Address Resolution Protocol table or cache: A temporary table stored in RAM containing IPv4 to MAC mappings.
- Map or Mapping: Each entry that describes a relationship between two values is a map or mapping.
- DAI, Dynamic ARP Inspection: An ARP spoofing & poisoning mitigation technique used by enterprise-level switches.
- ND or NDP, (ICMPv6) Neighbour Discovery: The IPv6 version of ARP.
- SN, Solicited Node: A link-local node used for multicast addressing in ICMPv6 Neighbor Solicitation requests.
- NA, Neighbor Advertisement: A reply to ICMPv6 Neighbor Solicitation requests.
- NS, Neighbor Solicitation message: One of five types of ICMPv6 ND messages.
- NA, Neighbor Advertisement message: One of five types of ICMPv6 ND messages.
- RS, Router Solicitation message: One of five types of ICMPv6 ND messages.
- RA, Router Advertisement message: One of five types of ICMPv6 ND messages.
- SLAAC, Stateless Address Autoconfiguration: A common use of ICMPv6 ND Router Solicitation & Router Advertisement messages.
- CIDR notation, Classless Inter-Domain Routing notation: An alternative way of expressing subnet masks.
- NAT, Network Address Translation: Used to ranslate a private address to a public one on the router that connects the internal network to the ISP's network.
- DMZ, demilitarized zone: a network segment designed to expose services to the public while isolating them from the internal network.
- APIPA, Automatic Private IP Adressing: a Windows service uses the 169.254.0.0/16 range in the even that there are no DHCP servers available on the network.
- RIR, Regional Internet Registry: Resposible for allocating IP addresses to ISPs.
- VLSM, Variable Length Subnet Masking: A subnetting technique used to avoid wasting addresses by assigning different subnet sizes based on host requirements.
- GUA, Global Unicast Address: A globally unique, internet-routable IPv6 address, functionally similar to a public IPv4 address.
- LUA, Link-local Unicast Address: An IPv6 address automatically assigned from `fe80::/10`, used only for communication within the same link (subnet). Mandatory in IPv6 and not routable.
- DAD, Duplicate Address Detection: A system to verify EUI-64 and random ID uniqueness.
- ICMP, Internet Control Message Protocol: A protocol used to test, verify and troubleshoot network connectivity.
- RTT, round-trip time: A performance indicator used by the `ping` command.
- TCP, Transmission Control Protocol: A reliable and connection-oriented way of transporting data between the internet and application layers.
- UDP, User Datagram Protocol: A fast, lightweight, connectionless and best-effort way of transporting data between the internet and application layers.
- ISN, Initial Sequence Number: The TCP sequence number that identifies the first byte of data in a segment.
- SACK, Selective Acknowledgement: A modern TCP data loss and transmission function allowing for selective data recovery.
- MSS, Maximum Segment Size: Sets the maximum size amount in bytes of a transmittable segment. This is a TCP flow control function. 
- MKV, Matroska video
- MPG, Motion Pictures Expert Group
- MOV, Quick Time MOV
- GIF, Graphics Interchange Format
- JPG, Joint Photographic Experts Group
- PNG, Portable Network Graphics
- BOOTP, Bootsrap Protocol: Enables a diskless workstation to discover its own IP address, the IP address of a BOOTP server on the network, and a file to be loaded into memory to boot the machine.
- FTP, File Transfer Protocol
- TFTP, Trivial File Transfer Protocol
- HTTP, Hypertext Transfer Protocol
- HTTPS, Hypertext Transfer Protocol Secure: Data is encrypted using Transport Layer Security (TLS) or its predecessor Secure Sockets Layer (SSL)
- HTML, Hypertext Markup Language
- URL, Uniform Resource Locator
- TLS, Transport Layer Security
- SSL, Secure Sockets Layer
- SMTP, Simple Mail Transfer Protocol: sending mail
- POP, Post Office Protocol: retrieving mail with no centralized storage
- IMAP, Internet Message Access Protocol: retrieving and managing mail with centralized storage
- FQDN, Fully Qualified Domain Name
- TLD, Top-level Domain: Indicate organization type or country (e.g.: `.com`, `.org`, `.au`, etc.)
- SMB, Server Message Block: A common file / resource sharing protocol based on long-lived connections.
- ESD, Electrostatic discharge: A physical network maintenance threat.
- UPS, Uninterruptible Power Supply: A physical power protection device.
- Malware, Malicious Software
- Dos, Denial of Service: A Network attack
- DDos, Distributed Denial of Service: A Network attack
- Botnet, a network of compromised "zombie" systems: Commonly used in DDoS attacks.
- ESA, Email Security Appliance: filters spam and suspicious emails.
- WSA, Web Security Appliance: filters known and suspicious malware websites.
- AAA, Authentication, Authorization and Accounting: A framework to control and monitor access to network devices and resources.
- SPI, Stateful Packet Inspection: A firewall type to recognize and filter out specific types of attacks such as DoS.

## Well-known ports
- FTP Data : TCP 20
- FTP Control : TCP 21
- SSH : TCP 22
- TELNET : TCP 23
- SMTP : TCP 25
- DNS : TCP/UDP 53
- DHCP Server: UDP 67
- DHCP Client: UDP 68
- TFTP : TCP 69
- HTTP : TCP 80 | TCP 8080
- POP3 : TCP 110
- IMAP : TCP 143
- HTTPS : TCP 443

## Commands
Basic IOS navigation:
- `enable`
- `disable`
- `configure terminal`
- `line <type> <range min> <range max>`
- `interface <type> <slot/port>`
- `exit`

Basic configuration:
- Restard device: `reload`
- `(config)# hostname <name`
- User-EXEC password: `(config-line)# password <password>`
- Priv-EXEC password: `(config-line)# enable secret <password>`
- Enable passwords: `(config-line)# login`
- Encrypting passwords: `(config)# service password-encryption`
- Banner: `(config)# banner motd <delimiter><text><delimiter>`
- Default gateway: `(config) ip default-gateway <ipv4 address>`

Additional password configuration:
- Set min-length: `(config)# security passwords min-length <number>`
- Set attempt-block: `(config)# login block-for 120 attempts 3 within 60`
- Auto timeout: `(config-line)# exec-timeout 5 30`

Saving / Deleting configs:
- Saving config: `# copy startup-config running-config`
- Deleting config: `# erase startup-config`
- Show current config: `show running-config`
- Show saved config: `show startup-config`

Enabling an interface:
- Selecting interface: `(config)# interface <interface>`
- Optional - Description: `(config)# description <text>`
- Ipv4 config: `(config-if)# ip address 10.10.10.10 255.255.255.0`
- Enabling interface: `(config-if)# no shutdown`

Enabling SVI:
- Selecting interface: `(config)# interface vlan 1`
- Optional - Description: `(config)# description <text>`
- Ipv4 config: `(config-if)# ip address 10.10.10.10 255.255.255.0`
- Enabling interface: `(config-if)# no shutdown`

Securing vty lines:
- enable ssh & telnet: `(config-line)# transport input ssh telnet`
- enable ssh-only: `(config-line)# transport input ssh`
- disable all: `(config-line)# transport input none`

Enabling ssh (all steps are required):
- step 1 - hostname: `(config)# hostname <name>`
- step 2 - domain name: `(config)# ip <domain name> <domain>`
- step 3 - generate rsa-key: `(config)#crypto key generate rsa general-keys modulus 1024`
- step 4 - create user: `(config)# username <username> password <password>`
- step 4 - create user: `(config)# username <username> secret <password>`
- Optional - select version: `(config)# ip ssh version <number>`

Cisco AutoSecure:
- Start dialog: `# auto secure`

Verify connectivity:
- `ping <ip>`
- Windows: `tracert <ip>`
- Windows extended: `tracert /?`
- Cisco: `traceroute <ip>`

Host and IOS commands:
- Windows ip: `ipconfig`
- Linux & macOS ip: `ifconfig`
- Cisco ip: `show ip(v6) interface brief`

- Windows ip extended: `ipconfig /all`
- Linux ip extended: `ifconfig -a`
- Cisco ip extended: `show ip interface`

- Windows ip renew: `ipconfig /release`

- Linux & macOS interface: `ifconfig <interface>`
- Cisco interface: `show interfaces`

- Windows route table: `route print` or `netstat -r`
- Cisco route table: `show ip(v6) route`
- Cisco links: `show cdp neighbors`

- Windows arp cache: `apr -a`
- Cisco arp cache: `show arp`

- Windows dns lookup: `nslookup`
- Windows dns cache: `ipconfig /displaydns`

- Cisco protocols: `show protocols`
- Cisco version: `show version`
- Cisco debug: `debug <arg1> <arg2>`
- Cisco un-debug: `undebug <arg1> <arg2>`
- Cisco un-debug all: `undebug all`
- Cisco logging: `terminal monitor`

## Subnetting math functions
- Number of hosts = 2^host bits
- Usable number of hosts = 2^host bits - 2
- Amount of subnets = 2^borrowed bits
- Subnet increments = 2^(32 - CIDR)

## IP classes & RFC 1918
CLASS A:
- A public: 1.0.0.0 - 126.255.255.255
- A private: 10.0.0.0 - 10.255.255.255
- A loopback: 127.0.0.0 - 127.255.255.255
- A CIDR: /8

CLASS B:
- B public: 128.0.0.0 - 191.255.255.255
- B APIPA: 169.254.0.1 - 169.254.255.254
- B private: 172.16.0.0 - 172.31.255.255
- B CIDR: /16

CLASS C:
- C public: 192.0.0.0 - 123.255.255.255
- C private 192.168.0.0 - 192.168.255.255

CLASS D:
- D multicast: 224.0.0.0 - 239.255.255.255

CLASS E:
- E experimental: 240.0.0.0 - 254.255.255.255

## Protocol structures
Data Link frame (header + data + trailer):
- Ethernet Protocol:
  - 802.2 Logical Link Control
  - 802.3 Ethernet
  - 802.3u FastEthernet
  - 802.11 WAN
  - 802.11 Bluetooth
  - 802.15.4 Zigbee
  - 802.16 WiMAX
- LLC: IPv4, IPv6, ARP
- MAC:
  - src, dest
  - Frame Check Sequence (FCS) using Cyclic Redundancy Check (CRC)
  - Half-Duplex error checking:
    - CSMA/CD (Ethernet)
    - CSMA/CA (Wi-Fi)

IP packet (header + data):
- connectionless
- best effort: packet delivery is not guaranteed
- media independent
- addressing:
  - IPv4
  - IPv6
  - ARP & IPv6 ND
  - NAT
- routing:
  - OSPF
  - EIGRP
  - BGP

IPv6 packet (header + data):
- Global Unicast Address (GUA)
- Link-local Address (LLA)
- Assigned by:
  - SLAAC
  - DHCPv6
  - Static (manual)

Neighbor Discovery (IPv6 ND):
- Neighbor Discovery:
  - Neighbor Solicitation (NS, request)
  - Neighbor Advertisement (NA, reply)
- Router discovery:
  - Router Solicitation (RS, request)
  - Router Advertisement (RA, reply)
- Redirect Messages

ICMP:
- best-effort protocol for controlling internet messages
- echo request
- echo reply
- destination network unreachable
- destination host unreachable
- destination protocol unreachable
- destination host unknown
- TTL expired

TCP segment (header + data):
- reliable
- connection-oriented
- stateful
- flags:
  - SYN
  - ACK
  - FIN
  - URG
  - PSH
  - RST
- TCP handshake + SACK:
  - SYN
  - SYN, ACK
  - ACK
- TCP session end:
  - FIN
  - ACK
  - FIN
  - ACK

UDP segment (header + data):
- best-effort
- connectionless
- stateless

HTTP & HTTPS methods:
- GET
- POST
- PUT

DNS:
- Message types:
  - DNS query
  - DNS response
- Record types:
  - A: IPv4
  - AAAA: IPv6
  - NS: Authoritative name server
  - MX: Mail exchange server

DHCP:
1. DISCOVER
2. OFFER
3. REQUEST
4. ACK

DHCPv6:
1. SOLICIT
2. ADVERTISE
3. INFORMATION REQUEST
4. REPLY

## Popular Organisations
- IEEE, Institute of Electrical and Electronics Engineers: wires & Wi-Fi
- IETF, Internet Engineering Taskforce: Internet protocols
- ICANN, Internet Corporation for Assigned Names and Numbers: names & numbers
- IANA, Internet Assigned Numbers Authority: names & numbers
- IAB, Internet Architecture Board: architecture & protocols.