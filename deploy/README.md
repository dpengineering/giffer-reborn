# Classroom self-hosting

GitHub Pages blocked at school? No problem. Giffer Reborn is a plain static site
(HTML/JS/CSS, no server code), so any computer on your classroom network can
serve it. These scripts turn a spare Ubuntu desktop into that server.

## What you get

- The site starts **automatically on every boot** (a `systemd` service).
- On boot it does a **best-effort `git pull`** so lessons stay current — but if
  the network or GitHub is unreachable, it just serves the copy already on disk.
- A **big-URL display** for the projector so students can type the address.

## First-time setup (do this once)

`setup.sh` installs `python3` (the server) plus `git`, `avahi-daemon`, and
`figlet` (best effort), copies the site into `~/giffer-reborn`, and installs +
starts the auto-boot service. When it finishes it prints the classroom URL.

### Path A — offline / USB (use this if the box can't reach github.com)

The district blocks GitHub Pages and may block `github.com` too, so the safest
route never asks the box to reach GitHub:

1. On a computer that *can* reach GitHub (your own laptop), get the repo:
   ```bash
   git clone https://github.com/dpengineering/giffer-reborn.git
   ```
2. Copy the whole `giffer-reborn` folder onto a USB stick, then onto the
   classroom box (e.g. into your home folder or Downloads).
3. On the box, open a terminal in that folder and run:
   ```bash
   sudo bash deploy/setup.sh
   ```

`setup.sh` installs from the folder you ran it out of — no GitHub needed. If the
box is also cut off from Ubuntu's apt servers, `python3` is already on any
Ubuntu desktop, so the site still runs; you'd only lose the `.local` name
(avahi) and the fancy banner (figlet), both non-essential.

### Path B — clone on the box (only if github.com works there)

```bash
git clone https://github.com/dpengineering/giffer-reborn.git
cd giffer-reborn
sudo bash deploy/setup.sh
```

## Every school day

1. **Power on the box.** The server starts by itself — nothing to type.
2. Open a terminal and run the URL display for the projector:
   ```bash
   ~/giffer-reborn/deploy/show-ip.sh
   ```
   (See "Fully hands-free" below to make even this automatic.)
3. Students open that `http://…` address in their Chromebook browser.

## The address students type

The setup uses **port 80**, so the URL is just the bare IP, e.g.
`http://192.168.1.42` — no `:8000` to explain.

Two gotchas worth knowing:

- **The IP can change day to day** (DHCP hands out a new one). That's exactly
  why `show-ip.sh` re-reads and re-displays it live. Two ways to get a *stable*
  address instead:
  - **mDNS name (easiest):** setup installs Avahi, so the box is reachable at
    `http://<hostname>.local` (whatever `hostname` reports). Chromebooks resolve
    `.local` names — this usually just works and never changes.
  - **DHCP reservation / static IP:** ask your IT/network admin to pin this
    machine's MAC address to a fixed IP. Then the URL is the same every day.

- **GitHub reachability:** the district blocked *Pages* (`*.github.io`). If they
  also block `github.com`, the boot-time `git pull` will quietly time out and
  serve the on-disk copy — the site still works, it just won't auto-update. To
  update in that case, bring the box home (or onto a network that can reach
  GitHub) and let it pull, or copy the files over by USB.

## Fully hands-free (optional)

To make the projector URL appear on login without opening a terminal, add
`show-ip.sh` as a GNOME **Startup Application**:

1. Open "Startup Applications" (or run `gnome-session-properties`).
2. Add → Command: `gnome-terminal --full-screen -- bash -lc "~/giffer-reborn/deploy/show-ip.sh"`
3. Enable your user's automatic login in Settings → Users, so powering on lands
   straight on the desktop with the URL already showing.

## Handy commands

```bash
systemctl status giffer.service     # is it running?
journalctl -u giffer.service -f     # live server log
sudo systemctl restart giffer.service
sudo systemctl disable --now giffer.service   # turn auto-start off
```

To test by hand on a non-privileged port (no `sudo`, no service):

```bash
GIFFER_PORT=8000 deploy/serve.sh
# then visit http://localhost:8000
```

## Changing the port

Both `serve.sh` and `show-ip.sh` read `GIFFER_PORT` (default `80`), and the
service sets it via `Environment=GIFFER_PORT=80` in `giffer.service`. Change all
three if you want a different port, then `sudo systemctl daemon-reload &&
sudo systemctl restart giffer.service`.
