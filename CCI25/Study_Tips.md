---
layout: page
title: Roadmap & Tips
permalink: /Roadmap/
nav_order: 1
---

<img src="/Images/Roadmap.png" alt="Roadmap logo" width="35"/><span style="font-size: 25px;"><strong> Roadmap </strong></span>

```mermaid
graph TD;
	
	subgraph Code[Programming fundamentals]
		subgraph HL[High-Level]
			cs["C# (C Sharp)"]
		end
		subgraph LL[Lower-Level]
			cpp[C / C++]
			--> x86-64[x86 / x86_64 assembly]
		end
	end

	subgraph OS[Operating System fundamentals]
		os[Operating systems]
		--> winint[Windows internals]
	end

	subgraph RE[Reverse Engineering]
		sa[Static analysis]
		da[Dynamic analysis]
		dd[Debuggers & Disassemblers]
	end

	subgraph NS[Networking and security]
		subgraph NET[Networking Concepts]
			osi[OSI Model]
			ip[IP Model]
			tecp[TCP/IP Protocols]
		end

		subgraph PEN[Pentesting basics]
			REC[Reconnaissance & Scanning]
			EXP[Exploiting & Post-Exploitation]
			SOC[SOC Techniques]
		end
	end

LL <-.-> RE
OS <-.-> RE
NET -.-> PEN
```

{: .warning}
> - Add this folder to your windows defender exclusions as it might remove valuable resources.
> - Don't jump from topic to topic unless you know what you're doing. Most of the "steps" build on top of each other.
> - Install add-ons like [dark reader](https://darkreader.org/) and [remove HTML elements](https://chromewebstore.google.com/detail/remove-html-elements/enegojdnkeicfoiknhfjaedhlckeahmf?hl=en&pli=1) that make reading better.
> - If you really can't wrap your head around something, just ask [ChatGPT](https://chatgpt.com/) to clarify it.
> - Keep note of where you left off studying and make bookmarks in your browser application.
