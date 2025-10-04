//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";

contract TimeBasedNFT is ERC721Enumerable {
    using Strings for uint256;

    uint256 private _currentTokenId;
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant MINT_PRICE = 0.01 ether;

    // Mapping from token ID to timezone offset (in minutes from UTC)
    mapping(uint256 => int256) public tokenTimezones;

    // Time periods for different states (in hours from midnight UTC)
    uint256 public constant NIGHT_START = 22; // 22:00 UTC
    uint256 public constant NIGHT_END = 6; // 06:00 UTC
    uint256 public constant MORNING_START = 6; // 06:00 UTC
    uint256 public constant MORNING_END = 12; // 12:00 UTC
    uint256 public constant DAY_START = 12; // 12:00 UTC
    uint256 public constant DAY_END = 22; // 22:00 UTC

    enum TimeState {
        NIGHT, // 22:00 - 06:00
        MORNING, // 06:00 - 12:00
        DAY // 12:00 - 22:00
    }

    constructor() ERC721("TimeBasedNFT", "TBNFT") {}

    function mint(int256 timezoneOffsetMinutes) public payable returns (uint256) {
        require(_currentTokenId < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(timezoneOffsetMinutes >= -720 && timezoneOffsetMinutes <= 720, "Invalid timezone");

        _currentTokenId += 1;
        uint256 tokenId = _currentTokenId;
        tokenTimezones[tokenId] = timezoneOffsetMinutes;
        _mint(msg.sender, tokenId);

        return tokenId;
    }

    function getCurrentTimeState(uint256 tokenId) public view returns (TimeState) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        int256 timezoneOffset = tokenTimezones[tokenId];
        uint256 currentHour = getCurrentHourInTimezone(timezoneOffset);

        if (currentHour >= NIGHT_START || currentHour < NIGHT_END) {
            return TimeState.NIGHT;
        } else if (currentHour >= MORNING_START && currentHour < MORNING_END) {
            return TimeState.MORNING;
        } else {
            return TimeState.DAY;
        }
    }

    function getCurrentHourInTimezone(int256 timezoneOffsetMinutes) internal view returns (uint256) {
        uint256 utcHour = (block.timestamp / 3600) % 24;
        int256 timezoneHour = int256(utcHour) + (timezoneOffsetMinutes / 60);

        // Handle day overflow/underflow
        if (timezoneHour < 0) {
            timezoneHour += 24;
        } else if (timezoneHour >= 24) {
            timezoneHour -= 24;
        }

        return uint256(timezoneHour);
    }


    // Get detailed time information for a token
    function getDetailedTimeInfo(
        uint256 tokenId
    )
        public
        view
        returns (
            uint256 utcTimestamp,
            uint256 utcHour,
            uint256 utcMinute,
            uint256 localHour,
            uint256 localMinute,
            int256 timezoneOffset,
            uint256 currentState,
            string memory stateName
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        utcTimestamp = block.timestamp;
        utcHour = (block.timestamp / 3600) % 24;
        utcMinute = (block.timestamp / 60) % 60;
        timezoneOffset = tokenTimezones[tokenId];

        // Calculate local time
        int256 localTimestamp = int256(block.timestamp) + (timezoneOffset * 60);
        localHour = uint256((localTimestamp / 3600) % 24);
        localMinute = uint256((localTimestamp / 60) % 60);

        // Handle negative local time
        if (localTimestamp < 0) {
            localHour = (localHour + 24) % 24;
        }

        currentState = uint256(getCurrentTimeState(tokenId));
        stateName = getStateName(getCurrentTimeState(tokenId));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        TimeState currentState = getCurrentTimeState(tokenId);
        string memory stateName = getStateName(currentState);

        // Get detailed time info
        (
            uint256 utcTimestamp,
            uint256 utcHour,
            uint256 utcMinute,
            uint256 localHour,
            uint256 localMinute,
            int256 timezoneOffset,
            ,

        ) = getDetailedTimeInfo(tokenId);

        string memory name = string(abi.encodePacked("TimeBased NFT #", tokenId.toString()));

        // Format timezone string
        string memory timezoneStr = formatTimezoneString(timezoneOffset);

        string memory description = string(
            abi.encodePacked(
                "A dynamic NFT that changes based on time of day. ",
                "Current state: ",
                stateName,
                ". Local time: ",
                Strings.toString(localHour),
                ":",
                localMinute < 10 ? "0" : "",
                Strings.toString(localMinute),
                ". UTC time: ",
                Strings.toString(utcHour),
                ":",
                utcMinute < 10 ? "0" : "",
                Strings.toString(utcMinute),
                ". Timezone: ",
                timezoneStr
            )
        );

        string memory image = Base64.encode(bytes(generateSVG(tokenId, currentState)));

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"',
                                description,
                                '", "attributes": [{"trait_type": "Time State", "value": "',
                                stateName,
                                '"},{"trait_type": "Local Time", "value": "',
                                Strings.toString(localHour),
                                ":",
                                localMinute < 10 ? "0" : "",
                                Strings.toString(localMinute),
                                '"},{"trait_type": "UTC Time", "value": "',
                                Strings.toString(utcHour),
                                ":",
                                utcMinute < 10 ? "0" : "",
                                Strings.toString(utcMinute),
                                '"},{"trait_type": "Timezone", "value": "',
                                timezoneStr,
                                '"}], "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getStateName(TimeState state) internal pure returns (string memory) {
        if (state == TimeState.NIGHT) return "Night";
        if (state == TimeState.MORNING) return "Morning";
        return "Day";
    }

    function formatTimezoneString(int256 timezoneOffset) internal pure returns (string memory) {
        string memory sign = timezoneOffset >= 0 ? "+" : "";
        uint256 timezoneHours = uint256(int256(timezoneOffset / 60));
        uint256 timezoneMinutes = uint256(int256(timezoneOffset % 60));

        if (timezoneMinutes == 0) {
            return string(abi.encodePacked("UTC", sign, Strings.toString(timezoneHours)));
        } else {
            return
                string(
                    abi.encodePacked(
                        "UTC",
                        sign,
                        Strings.toString(timezoneHours),
                        ":",
                        Strings.toString(timezoneMinutes)
                    )
                );
        }
    }

    function generateSVG(uint256 tokenId, TimeState state) internal view returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                renderBackground(state),
                renderMainElement(state, tokenId),
                "</svg>"
            )
        );
        return svg;
    }

    function renderBackground(TimeState state) internal pure returns (string memory) {
        if (state == TimeState.NIGHT) {
            return
                string(
                    abi.encodePacked(
                        "<defs>",
                        '<radialGradient id="nightGrad" cx="50%" cy="50%" r="70%">',
                        '<stop offset="0%" style="stop-color:#1a1a3a;stop-opacity:1" />',
                        '<stop offset="100%" style="stop-color:#0a0a1e;stop-opacity:1" />',
                        "</radialGradient>",
                        "</defs>",
                        '<rect width="400" height="400" fill="url(#nightGrad)"/>',
                        // Stars
                        '<circle cx="80" cy="60" r="2" fill="#ffffff" opacity="0.9">',
                        '<animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="150" cy="40" r="1.5" fill="#ffffff" opacity="0.8">',
                        '<animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="220" cy="70" r="1.8" fill="#ffffff" opacity="0.7">',
                        '<animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="300" cy="50" r="1.2" fill="#ffffff" opacity="0.6">',
                        '<animate attributeName="opacity" values="0.2;0.7;0.2" dur="3.5s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="350" cy="80" r="1.6" fill="#ffffff" opacity="0.8">',
                        '<animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.8s" repeatCount="indefinite"/>',
                        "</circle>",
                        // Moon
                        '<circle cx="320" cy="100" r="25" fill="#f5f5dc" opacity="0.9"/>',
                        '<circle cx="315" cy="95" r="3" fill="#e6e6cd" opacity="0.7"/>',
                        '<circle cx="325" cy="105" r="2" fill="#e6e6cd" opacity="0.6"/>',
                        '<circle cx="318" cy="108" r="1.5" fill="#e6e6cd" opacity="0.5"/>'
                    )
                );
        } else if (state == TimeState.MORNING) {
            return
                string(
                    abi.encodePacked(
                        "<defs>",
                        '<linearGradient id="morningGrad" x1="0%" y1="0%" x2="0%" y2="100%">',
                        '<stop offset="0%" style="stop-color:#ff9a56;stop-opacity:1" />',
                        '<stop offset="30%" style="stop-color:#ffa726;stop-opacity:1" />',
                        '<stop offset="70%" style="stop-color:#ffcc80;stop-opacity:1" />',
                        '<stop offset="100%" style="stop-color:#fff3e0;stop-opacity:1" />',
                        "</linearGradient>",
                        '<radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">',
                        '<stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />',
                        '<stop offset="70%" style="stop-color:#ffcc02;stop-opacity:0.8" />',
                        '<stop offset="100%" style="stop-color:#ff8f00;stop-opacity:0.6" />',
                        "</radialGradient>",
                        "</defs>",
                        '<rect width="400" height="400" fill="url(#morningGrad)"/>',
                        // Clouds
                        '<ellipse cx="100" cy="120" rx="30" ry="15" fill="#ffffff" opacity="0.8"/>',
                        '<ellipse cx="120" cy="115" rx="25" ry="12" fill="#ffffff" opacity="0.7"/>',
                        '<ellipse cx="300" cy="100" rx="35" ry="18" fill="#ffffff" opacity="0.6"/>',
                        '<ellipse cx="320" cy="95" rx="20" ry="10" fill="#ffffff" opacity="0.5"/>'
                    )
                );
        } else {
            return
                string(
                    abi.encodePacked(
                        "<defs>",
                        '<linearGradient id="dayGrad" x1="0%" y1="0%" x2="0%" y2="100%">',
                        '<stop offset="0%" style="stop-color:#87ceeb;stop-opacity:1" />',
                        '<stop offset="50%" style="stop-color:#b3d9ff;stop-opacity:1" />',
                        '<stop offset="100%" style="stop-color:#e0f6ff;stop-opacity:1" />',
                        "</linearGradient>",
                        '<radialGradient id="sunGrad" cx="50%" cy="50%" r="60%">',
                        '<stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />',
                        '<stop offset="40%" style="stop-color:#ffeb3b;stop-opacity:0.9" />',
                        '<stop offset="80%" style="stop-color:#ffc107;stop-opacity:0.7" />',
                        '<stop offset="100%" style="stop-color:#ff8f00;stop-opacity:0.4" />',
                        "</radialGradient>",
                        "</defs>",
                        '<rect width="400" height="400" fill="url(#dayGrad)"/>',
                        // Sun rays
                        '<g stroke="#ffeb3b" stroke-width="2" opacity="0.6">',
                        '<line x1="200" y1="50" x2="200" y2="30"/>',
                        '<line x1="260" y1="70" x2="275" y2="55"/>',
                        '<line x1="280" y1="130" x2="295" y2="130"/>',
                        '<line x1="260" y1="190" x2="275" y2="205"/>',
                        '<line x1="200" y1="210" x2="200" y2="230"/>',
                        '<line x1="140" y1="190" x2="125" y2="205"/>',
                        '<line x1="120" y1="130" x2="105" y2="130"/>',
                        '<line x1="140" y1="70" x2="125" y2="55"/>',
                        "</g>",
                        // Clouds
                        '<ellipse cx="80" cy="80" rx="25" ry="12" fill="#ffffff" opacity="0.9"/>',
                        '<ellipse cx="95" cy="75" rx="20" ry="10" fill="#ffffff" opacity="0.8"/>',
                        '<ellipse cx="320" cy="90" rx="30" ry="15" fill="#ffffff" opacity="0.8"/>',
                        '<ellipse cx="340" cy="85" rx="22" ry="11" fill="#ffffff" opacity="0.7"/>'
                    )
                );
        }
    }

    function renderMainElement(TimeState state, uint256 tokenId) internal pure returns (string memory) {
        if (state == TimeState.NIGHT) {
            return
                string(
                    abi.encodePacked(
                        // Mystical orb with glow effect
                        "<defs>",
                        '<radialGradient id="nightOrb" cx="50%" cy="50%" r="50%">',
                        '<stop offset="0%" style="stop-color:#e6e6fa;stop-opacity:1" />',
                        '<stop offset="70%" style="stop-color:#9370db;stop-opacity:0.8" />',
                        '<stop offset="100%" style="stop-color:#4b0082;stop-opacity:0.6" />',
                        "</radialGradient>",
                        '<filter id="glow">',
                        '<feGaussianBlur stdDeviation="4" result="coloredBlur"/>',
                        '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
                        "</filter>",
                        "</defs>",
                        '<circle cx="200" cy="200" r="85" fill="url(#nightOrb)" opacity="0.3" filter="url(#glow)"/>',
                        '<circle cx="200" cy="200" r="70" fill="url(#nightOrb)" opacity="0.7"/>',
                        '<circle cx="200" cy="200" r="50" fill="url(#nightOrb)" opacity="0.9"/>',
                        // Magical sparkles
                        '<circle cx="160" cy="160" r="3" fill="#ffffff" opacity="0.9">',
                        '<animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="240" cy="170" r="2" fill="#e6e6fa" opacity="0.8">',
                        '<animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<circle cx="170" cy="240" r="2.5" fill="#dda0dd" opacity="0.7">',
                        '<animate attributeName="r" values="1.5;3;1.5" dur="2.5s" repeatCount="indefinite"/>',
                        "</circle>",
                        '<text x="200" y="330" text-anchor="middle" fill="#e6e6fa" font-family="serif" font-size="18" font-weight="bold">',
                        "Night Mystic #",
                        tokenId.toString(),
                        "</text>"
                    )
                );
        } else if (state == TimeState.MORNING) {
            return
                string(
                    abi.encodePacked(
                        // Rising sun with warm colors
                        "<defs>",
                        '<radialGradient id="morningSun" cx="50%" cy="50%" r="50%">',
                        '<stop offset="0%" style="stop-color:#fff8dc;stop-opacity:1" />',
                        '<stop offset="30%" style="stop-color:#ffd700;stop-opacity:0.9" />',
                        '<stop offset="70%" style="stop-color:#ff8c00;stop-opacity:0.8" />',
                        '<stop offset="100%" style="stop-color:#ff6347;stop-opacity:0.6" />',
                        "</radialGradient>",
                        "</defs>",
                        '<circle cx="200" cy="200" r="85" fill="url(#morningSun)" opacity="0.4"/>',
                        '<circle cx="200" cy="200" r="65" fill="url(#morningSun)" opacity="0.7"/>',
                        '<circle cx="200" cy="200" r="45" fill="url(#morningSun)" opacity="0.9"/>',
                        // Sun rays
                        '<g stroke="#ffd700" stroke-width="3" opacity="0.8">',
                        '<line x1="200" y1="100" x2="200" y2="80">',
                        '<animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>',
                        "</line>",
                        '<line x1="260" y1="140" x2="275" y2="125">',
                        '<animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>',
                        "</line>",
                        '<line x1="300" y1="200" x2="320" y2="200">',
                        '<animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>',
                        "</line>",
                        '<line x1="260" y1="260" x2="275" y2="275">',
                        '<animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>',
                        "</line>",
                        "</g>",
                        '<text x="200" y="330" text-anchor="middle" fill="#8b4513" font-family="serif" font-size="18" font-weight="bold">',
                        "Dawn Bringer #",
                        tokenId.toString(),
                        "</text>"
                    )
                );
        } else {
            return
                string(
                    abi.encodePacked(
                        // Bright sun with dynamic rays
                        "<defs>",
                        '<radialGradient id="daySun" cx="50%" cy="50%" r="50%">',
                        '<stop offset="0%" style="stop-color:#fffacd;stop-opacity:1" />',
                        '<stop offset="20%" style="stop-color:#ffff00;stop-opacity:0.95" />',
                        '<stop offset="60%" style="stop-color:#ffa500;stop-opacity:0.8" />',
                        '<stop offset="100%" style="stop-color:#ff4500;stop-opacity:0.5" />',
                        "</radialGradient>",
                        '<filter id="brightness">',
                        '<feGaussianBlur stdDeviation="2" result="coloredBlur"/>',
                        '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
                        "</filter>",
                        "</defs>",
                        '<circle cx="200" cy="200" r="90" fill="url(#daySun)" opacity="0.3" filter="url(#brightness)"/>',
                        '<circle cx="200" cy="200" r="70" fill="url(#daySun)" opacity="0.8"/>',
                        '<circle cx="200" cy="200" r="50" fill="url(#daySun)" opacity="1"/>',
                        // Rotating sun rays
                        '<g stroke="#ffff00" stroke-width="4" opacity="0.7">',
                        "<g>",
                        '<animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="15s" repeatCount="indefinite"/>',
                        '<line x1="200" y1="90" x2="200" y2="70"/>',
                        '<line x1="270" y1="130" x2="285" y2="115"/>',
                        '<line x1="310" y1="200" x2="330" y2="200"/>',
                        '<line x1="270" y1="270" x2="285" y2="285"/>',
                        '<line x1="200" y1="310" x2="200" y2="330"/>',
                        '<line x1="130" y1="270" x2="115" y2="285"/>',
                        '<line x1="90" y1="200" x2="70" y2="200"/>',
                        '<line x1="130" y1="130" x2="115" y2="115"/>',
                        "</g>",
                        "</g>",
                        '<text x="200" y="330" text-anchor="middle" fill="#8b4513" font-family="serif" font-size="18" font-weight="bold">',
                        "Solar Radiance #",
                        tokenId.toString(),
                        "</text>"
                    )
                );
        }
    }

    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
