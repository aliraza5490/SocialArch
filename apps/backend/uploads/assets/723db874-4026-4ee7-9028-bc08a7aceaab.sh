#!/bin/bash
set -e

# Update package manager
apt-get update

# Install SSH and sudo
apt-get install -y openssh-server sudo

# Create SSH directory
mkdir -p /run/sshd

# Allow password authentication
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Set root password
echo "root:${ROOT_PASSWORD:-ansible}" | chpasswd

# Generate SSH keys if they don't exist
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
    ssh-keygen -A
fi

echo "SSH setup complete"