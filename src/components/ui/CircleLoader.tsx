"use client";

const CircleLoader = ({ size = 20 }: { size?: number }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderWidth: 3,
            }}
            className="border-gray-300 border-t-cyan-400 rounded-full animate-spin"
        />
    );
};

export default CircleLoader;
